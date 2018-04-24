import { Injectable } from "@angular/core";
import { KeyPair, CryptoService } from "./crypto-service";
import { Account, Referential } from "./model";
import { Subject } from "rxjs";
import gql from "graphql-tag";
import { TranslateService } from "@ngx-translate/core";
import {Apollo} from "apollo-angular";
import {ApolloQueryResult} from "apollo-client";
import { Observable } from "apollo-link";

const base58 = require('../lib/base58')

export declare interface AccountHolder{
  loaded: boolean;
  keypair: KeyPair;
  pubkey: string;
  account: Account;
  // TODO : use this ?
  mainProfile: String;
};
export interface AuthData {
  username: string;
  password: string;
}
export interface RegisterData extends AuthData{
  account: Account;
}
const PUBKEY_STORAGE_KEY="pubkey"
const SECKEY_STORAGE_KEY="seckey"
const ACCOUNT_STORAGE_KEY="account"

const ERROR_CODES = {
  LOAD_ACCOUNT_ERROR: 1,
  BAD_PASSWORD: 2,
  UNKNOWN_ACCOUNT_EMAIL: 3,
  EMAIL_ALREADY_REGISTERED: 4,
  UNKNOWN_NETWORK_ERROR: 5
}

/* ------------------------------------
 * GraphQL queries
 * ------------------------------------*/ 
// Get account query
const AccountQuery = gql`
  query Account($pubkey: String){
    account(pubkey: $pubkey){
      id
      firstName
      lastName
      email
      pubkey
      avatar
      settings {
        locale
      }
    }
  }
`;
export declare type AccountVariables = {
  pubkey: string;
}
export declare type AccountResult = {
  account: Account;
}

// Check email query
const IsEmailExistsQuery = gql`
  query IsEmailExists($email: String, $hash: String){
    isEmailExists(email: $email, hash: $hash)
  }
`;
export declare type IsEmailExistsVariables = {
  email: string;
  hash: string;
}
export declare type  IsEmailExistsResult = {
  isEmailExists: boolean;
}

// Create account query
const CreateAccountQuery = gql`
  mutation createAccount($account:AccountVOInput){
    createAccount(account: $account){
      id
      updateDate
    }
  }
`;

@Injectable()
export class AccountService {

  private data:AccountHolder = {    
    loaded: false,
    keypair: null,
    pubkey: null,
    mainProfile: null,
    account: null
  };


  public onLogin: Subject<Account> = new Subject<Account>();
  public onLogout: Subject<any> = new Subject<any>();

  public get account(): Account {
    return this.data.loaded ? this.data.account : undefined;
  }

  constructor(
    private apollo: Apollo,
    private translate: TranslateService,
    private cryptoService: CryptoService
  ) {
    this.resetData();
    this.restoreLocally()
      .then((account) => {
        if (account) {
          this.onLogin.next(this.data.account);
        }
      });
  }

  private resetData() {
    this.data.loaded = false;
    this.data.keypair = null;
    this.data.pubkey = null;
    this.data.mainProfile = null;
    this.data.account = new Account();
  }

  public isLogin():boolean {
    return !!(this.data.pubkey && this.data.loaded);
  }

  public isAuth():boolean {
    return !!(this.data.pubkey && this.data.keypair && this.data.keypair.secretKey);
  }

  public hasProfile(label: string):boolean {
    if (!this.data.account || !this.data.account.pubkey) return false;

    return this.data.account.profiles && this.data.account.profiles.filter(up => up.label == label).length > 0;
  }

  public isAdmin():boolean {
    return this.hasProfile("Administrator");
  }

  public register(data: RegisterData): Promise<Account> {
    if(this.isLogin()) {
      return Promise.reject("User already login");
    }
    if (!data.username || !data.username) return Promise.reject("Missing required username por password");

    console.debug('[wallet] Register new user account...', data.account);
    this.data.loaded = false;
    let now = new Date();

    return this.cryptoService.scryptKeypair(data.username, data.password)
      .then((keypair) => {
        data.account.pubkey = base58.encode(keypair.publicKey);

        // Default values
        data.account.settings.locale = data.account.settings.locale || this.translate.currentLang;

        // TODO: add department to register form
        data.account.department.id  =  data.account.department.id || 1; 

        this.data.keypair = keypair;
        return this.createAccount(data.account, keypair); 
      })
      .then((savedAccount) =>  {

        // Default values
        savedAccount.avatar = savedAccount.avatar || "../assets/img/person.png";
        this.data.mainProfile = this.getMainProfile(savedAccount.profiles);
        
        this.data.account = savedAccount;
        this.data.pubkey = savedAccount.pubkey;
        this.data.loaded = true;

        return this.saveLocally();
      })
      .then(() => {
        console.debug("[wallet] Account sucessfully registered in " + (new Date().getTime() - now.getTime()) + "ms");
        this.onLogin.next(this.data.account);        
        return this.data.account;
      })
      .catch((error) => {
        console.error(error);
        this.resetData();
        return undefined;
      });
  }

  public login(data: AuthData): Promise<Account> {
    if (!data.username || !data.username) return Promise.reject("Missing required username por password");

    console.debug("[wallet] Login user {"+ data.username+"}...");

    return this.cryptoService.scryptKeypair(data.username, data.password)
      .catch((error) => {
        console.error(error);
        this.resetData();
        throw new Error("ERROR.SCRYPT_ERROR");
      })
      .then((keypair) => {
        this.data.pubkey = base58.encode(keypair.publicKey);
        this.data.keypair = keypair;
        return this.loadData()
          .catch(err => {
            // If account not found, check if email is valid
            if (err && err.code == ERROR_CODES.LOAD_ACCOUNT_ERROR) {
              return this.isEmailExists(data.username)
                .catch(otherError => {
                  throw err; // resend the first error
                })
                .then(isEmailExists => {
                  // Email not exists (no account)
                  if (!isEmailExists) {
                    throw {code: ERROR_CODES.UNKNOWN_ACCOUNT_EMAIL, message: "ERROR.UNKNOWN_ACCOUNT_EMAIL"};
                  }
                  // Email exists, so error = 'bad password' 
                  throw {code: ERROR_CODES.BAD_PASSWORD, message: "ERROR.BAD_PASSWORD"}
                });
            }
            throw err; // resend the first error
          })
      })      
      .then(() => {
        return this.saveLocally();
      })
      .then(() => {
        console.debug("[wallet] Sucessfully login");
        this.onLogin.next(this.data.account);
        return this.data.account;
      })
      ;
  }


  loadData(): Promise<Account> {
    if (!this.data.pubkey) return Promise.reject("User not logged");

    this.data.loaded = false;
    console.debug("[wallet] Loading wallet data...");
    var now = new Date();

    return this.loadAccount(this.data.pubkey)
      .then((account) => {
        account = account || new Account();

        // Default values
        account.avatar = account.avatar || "../assets/img/person.png";
        account.settings.locale = account.settings.locale || this.translate.currentLang;

        // Read main profile
        this.data.mainProfile = this.getMainProfile(account.profiles);

        this.data.account = account;
        this.data.loaded = true;
        console.debug("[wallet] Wallet data loaded in " + (new Date().getTime()-now.getTime()) + "ms");
        return this.data.account;
      })
      .catch((error) => {
        this.resetData();
        if (error.code && error.message) throw error;

        console.error(error);
        throw {
          code: ERROR_CODES.LOAD_ACCOUNT_ERROR,
          message: 'ERROR.LOAD_ACCOUNT_ERROR'
        };
      });
  }

  public restoreLocally() : Promise<Account>{
    let pubkey = window.localStorage.getItem(PUBKEY_STORAGE_KEY);

    if (!pubkey) return Promise.resolve(undefined);

    console.debug("[wallet] Restoring user account {"+pubkey+"}'...");
    return new Promise((resolve) => {
      this.data.pubkey = pubkey;

      // Get account from local storage
      let accountStr   = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (!accountStr) return resolve(undefined);

      let accountObj:any = JSON.parse(accountStr);
      if (!accountObj) return resolve(undefined);

      let account = new Account();
      account.fromObject(accountObj);
      if (account.pubkey != pubkey) return resolve(undefined);

      this.data.account = account;
      this.data.mainProfile = this.getMainProfile(account.profiles);
      this.data.loaded = true;
      resolve(account);
    });
    
  }

  public saveLocally(): Promise<void> {
    if (!this.data.pubkey) return Promise.reject("User not logged");

    console.debug("[wallet] Saving data in local storage...");

    return new Promise((resolve) => {
      window.localStorage.setItem(PUBKEY_STORAGE_KEY, this.data.pubkey);

      let copy = this.data.account.asObject();
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY,  JSON.stringify(copy));
      console.debug("[wallet] Data saved in local storage");
      resolve();
    });
  }

  public logout(): Promise<void>{
    this.resetData();

    window.sessionStorage.removeItem(SECKEY_STORAGE_KEY);
    window.localStorage.removeItem(PUBKEY_STORAGE_KEY);
    window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);

    // Clear cache
    this.apollo.getClient().cache.reset();

    this.onLogout.next();

    return Promise.resolve();
  }

  /**
   * Load a account by pubkey
   * @param pubkey 
   */
  public loadAccount(pubkey: string): Promise<Account> {

    this.apollo.getClient().cache.reset();
    const variables:AccountVariables = {
      pubkey: pubkey
    };
    return new Promise<Account>((resolve, reject) => {
      let subscription = this.apollo.query<ApolloQueryResult<AccountResult>, AccountVariables>({
          query: AccountQuery,
          variables: variables
        })
        .catch(err => {
          if (err && err.networkError) {
            console.error("[account] " + err.networkError.message);
            return Observable.of({
              errors: [{code: ERROR_CODES.UNKNOWN_NETWORK_ERROR, message: "ERROR.UNKNOWN_NETWORK_ERROR"}],
              data: null
            });
          }
          return Observable.of({errors: [err], data: null});
        })
        .subscribe(({data, errors}) => {      
            if (errors) {
              reject(errors[0]);
            }
            else if (data && data['account']) {
              const res = new Account();
              res.fromObject(data['account']);
              resolve(res);
            }
            else {
              resolve();
            }
            subscription.unsubscribe();
          });
      });
  }

  /**
   * Creating a user account
   * @param account 
   * @param keyPair 
   */
  public createAccount(account: Account, keyPair: KeyPair): Promise<Account> {

    const json = account.asObject();
    json.pubkey = json.pubkey || base58.encode(keyPair.publicKey);

    console.debug("[trip-service] Creating account ", json);
    return new Promise<Account>((resolve, reject) => {
      let subscription = this.apollo.mutate({
        mutation: CreateAccountQuery,
        variables: {
          account: json
        }
      })
      .subscribe(({data}) => {
        let copy = account.clone();
        let res = data && data['createAccount'];
        if (res) {
          copy.id = res.id;
          copy.updateDate = res.updateDate;
          resolve(copy);
        }
        else {
          reject("Unable to create account");
        }
        subscription.unsubscribe();
      });
    });
  }

  /**
   * Check if email is available for new account registration.
   * Throw an error if not available
   * @param email
   */
  public checkEmailAvailable(email: string): Promise<void> {

    return this.isEmailExists(email)
      .then(isEmailExists => {      
          if (isEmailExists) {
            throw {code: ERROR_CODES.EMAIL_ALREADY_REGISTERED, message: "ERROR.EMAIL_ALREADY_REGISTERED"};
          }
        });
  }

  /**
   * Check if email is exists in server.
   * @param email
   */
  public isEmailExists(email: string): Promise<boolean> {

    console.debug("[wallet] Checking if {"+email+"} exists...");

    this.apollo.getClient().cache.reset();
    const variables:IsEmailExistsVariables = {
      email: email,
      hash: undefined
    };
    return new Promise<boolean>((resolve, reject) => {
      let subscription = this.apollo.query<ApolloQueryResult<IsEmailExistsResult>, IsEmailExistsVariables>({
          query: IsEmailExistsQuery,
          variables: variables
        })
        .catch(err => {
          return Observable.of({data: null, errors: [err]});
        })
        .subscribe(({data, errors}) => {      
            if (errors) {
              reject(errors[0].message);
            }
            else {
              let isEmailExists = data && data['isEmailExists'];
              resolve(isEmailExists);
            }
            subscription.unsubscribe();
          });
      });
  }

  /* -- Protected methods -- */

  private getMainProfile(profiles?: Referential[]): String {

    if (!profiles || profiles.length == 0) return 'user'; // default profile

    // TODO: sort by label ?
    // ADMIN => LOCAL_ADMIN  => OBSERVER => VIEWER => USER
    return profiles[0].label;
  }
}
