import { Injectable } from "@angular/core";
import { KeyPair, CryptoService } from "./crypto-service";
import { Account, Referential } from "./model";
import { Subject, Observable, Subscription } from "rxjs";
import gql from "graphql-tag";
import { TranslateService } from "@ngx-translate/core";
import {Apollo} from "apollo-angular";
import { DocumentNode } from "graphql";
import { BaseDataService } from "./data-service";
import { ErrorCodes } from "./errors";

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

/* ------------------------------------
 * GraphQL queries
 * ------------------------------------*/ 
// Get account query
const AccountQuery: DocumentNode = gql`
  query Account($pubkey: String){
    account(pubkey: $pubkey){
      id
      firstName
      lastName
      email
      pubkey
      avatar
      statusId
      updateDate
      settings {
        id
        locale
        updateDate
      }
      department {
        id
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
const IsEmailExistsQuery: DocumentNode = gql`
  query IsEmailExists($email: String, $hash: String){
    isEmailExists(email: $email, hash: $hash)
  }
`;
export declare type IsEmailExistsVariables = {
  email: string;
  hash: string;
}

// Save (create or update) account mutation
const SaveAccountMutation: DocumentNode = gql`
  mutation saveAccount($account:AccountVOInput){
    saveAccount(account: $account){
      id
      updateDate
      settings {
        id
        updateDate
      }
    }
  }
`;

// Sent confirmation email
const SendConfirmEmailMutation: DocumentNode = gql`
  mutation sendAccountConfirmationEmail($email:String, $locale:String){
    sendAccountConfirmationEmail(email: $email, locale: $locale)
  }
`;

// Confirm account email
const ConfirmEmailMutation: DocumentNode = gql`
  mutation confirmAccountEmail($email:String, $code:String){
    confirmAccountEmail(email: $email, code: $code)
  }
`;


// Subscription TEST
const TestSubscription: DocumentNode = gql`
  subscription updateTrip($tripId: Int){
    updateTrip(tripId: $tripId)
  }
`;

@Injectable()
export class AccountService extends BaseDataService {

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
    protected apollo: Apollo,
    private translate: TranslateService,
    private cryptoService: CryptoService
  ) {
    super(apollo);
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
        return this.saveAccount(data.account, keypair); 
      })
      .then((account) =>  {

        // Default values
        account.avatar = account.avatar || "../assets/img/person.png";
        this.data.mainProfile = this.getMainProfile(account.profiles);
        
        this.data.account = account;
        this.data.pubkey = account.pubkey;
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

    console.debug("[account] Trying to login...");

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
            if (err && err.code == ErrorCodes.LOAD_ACCOUNT_ERROR) {
              return this.isEmailExists(data.username)
                .catch(otherError => {
                  throw err; // resend the first error
                })
                .then(isEmailExists => {
                  // Email not exists (no account)
                  if (!isEmailExists) {
                    throw {code: ErrorCodes.UNKNOWN_ACCOUNT_EMAIL, message: "ERROR.UNKNOWN_ACCOUNT_EMAIL"};
                  }
                  // Email exists, so error = 'bad password' 
                  throw {code: ErrorCodes.BAD_PASSWORD, message: "ERROR.BAD_PASSWORD"}
                });
            }
            throw err; // resend the first error
          })
      })      
      .then(() => {
        return this.saveLocally();
      })
      .then(() => {
        console.debug("[account] Sucessfully authenticated {"+this.data.pubkey.substr(0,6)+"}");
        this.onLogin.next(this.data.account);
        return this.data.account;
      })
      ;
  }

  public refresh(): Promise<Account> {
    if (!this.data.pubkey) return Promise.reject("User not logged");

    const locale = this.translate.currentLang;

    return this.loadData() 
      .then(() => {
        return this.saveLocally();
      })
      .then(() => {
        console.debug("[wallet] Sucessfully login");
        this.onLogin.next(this.data.account);
        return this.data.account;
      });
  }

  loadData(): Promise<Account> {
    if (!this.data.pubkey) return Promise.reject("User not logged");

    this.data.loaded = false;

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
        return this.data.account;
      })
      .catch((error) => {
        this.resetData();
        if (error.code && error.message) throw error;

        console.error(error);
        throw {
          code: ErrorCodes.LOAD_ACCOUNT_ERROR,
          message: 'ERROR.LOAD_ACCOUNT_ERROR'
        };
      });
  }

  public restoreLocally() : Promise<Account>{
    let pubkey = window.localStorage.getItem(PUBKEY_STORAGE_KEY);

    if (!pubkey) return Promise.resolve(undefined);

    console.debug("[account] Restoring account {"+pubkey.substr(0,6)+"}'...");
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

  /** 
  * Save account into the local storage
  */
  public saveLocally(): Promise<void> {
    if (!this.data.pubkey) return Promise.reject("User not logged");

    console.debug("[account] Saving account in local storage...");

    return new Promise((resolve) => {
      window.localStorage.setItem(PUBKEY_STORAGE_KEY, this.data.pubkey);

      let copy = this.data.account.asObject();
      window.localStorage.setItem(ACCOUNT_STORAGE_KEY,  JSON.stringify(copy));
      console.debug("[account] Account saved in local storage");
      resolve();
    });
  }

  /**
   * Create or update an user account, to the remote storage
   * @param account 
   * @param keyPair 
   */
  public saveRemotely(account: Account): Promise<Account> {
    if (!this.data.pubkey) return Promise.reject("User not logged");
    if (this.data.pubkey != account.pubkey) return Promise.reject("Not user account");

    return this.saveAccount(account, this.data.keypair)
      .then(updatedAccount => {

        // Default values
        account.avatar = account.avatar || "../assets/img/person.png";
        this.data.mainProfile = this.getMainProfile(account.profiles);

        this.data.account = account;
        this.data.loaded = true;

        return this.saveLocally();
      })
      .then(() => {
        this.onLogin.next(this.data.account);        
        return this.data.account;
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
  public loadAccount(pubkey: string): Promise<Account|undefined> {

    console.debug("[account-service] Loading account {"+pubkey.substring(0,6)+"}");
    var now = new Date();

    return this.query<{account: any}>({
      query: AccountQuery,
      variables: {
        pubkey: pubkey
      },
      error: {code: ErrorCodes.UNKNOWN_NETWORK_ERROR, message: "ERROR.UNKNOWN_NETWORK_ERROR"}
    })
    .then(res => {
      if (res && res.account) {
        const account = new Account();
        account.fromObject(res.account);
        console.debug("[account-service] Account {"+pubkey.substring(0,6)+"} loaded in " + (new Date().getTime()-now.getTime()) + "ms", res);
        return account;
      }
      else {
        console.warn("[account-service] Account {"+pubkey.substring(0,6)+"} not found !");
        return undefined;
      }
    });
  }

  /**
   * Create or update an user account
   * @param account 
   * @param keyPair 
   */
  public saveAccount(account: Account, keyPair: KeyPair): Promise<Account> {
    const json = account.asObject();
    json.pubkey = json.pubkey || base58.encode(keyPair.publicKey);

    console.debug("[account-service] Saving account {"+json.pubkey.substring(0,6)+"}...");
    let now = new Date

    return this.mutate<{saveAccount: any}>({
      mutation: SaveAccountMutation, 
      variables : {
        account: json
      },
      error: {
        code: ErrorCodes.SAVE_ACCOUNT_ERROR,
        message: "ERROR.SAVE_ACCOUNT_ERROR"
      }
    })
    .then(res => {
      let data = res.saveAccount;

      // Copy update properties
      account.id = data.id;
      account.updateDate = data.updateDate;
      account.settings.id = data.settings && data.settings.id;
      account.settings.updateDate = data.settings && data.settings.updateDate;

      console.debug("[account-service] Account {"+json.pubkey.substring(0,6)+"} saved in " + (new Date().getTime()-now.getTime()) + "ms", account);

      return account;
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
            throw {code: ErrorCodes.EMAIL_ALREADY_REGISTERED, message: "ERROR.EMAIL_ALREADY_REGISTERED"};
          }
        });
  }

  /**
   * Check if email is exists in server.
   * @param email
   */
  public isEmailExists(email: string): Promise<boolean> {

    console.debug("[wallet] Checking if {"+email+"} exists...");

    return this.query<{isEmailExists: boolean}, IsEmailExistsVariables>({
        query: IsEmailExistsQuery,
        variables: {
          email: email,
          hash: undefined
        }
      })
      .then(data => {      
        return data && data.isEmailExists;
      });
  }

  public sendConfirmationEmail(email: String, locale?: string) : Promise<boolean> {

    locale = locale || this.translate.currentLang;
    console.debug("[trip-service] Sending confirmation email to {"+email+"} with locale {"+locale+"}...");

    return this.mutate<boolean>({
      mutation: SendConfirmEmailMutation,
      variables: {
        email: email,
        locale: locale
      }, 
      error: {
        code: ErrorCodes.SENT_CONFIRMATION_EMAIL_FAILED, 
        message: "ERROR.SENT_ACCOUNT_CONFIRMATION_EMAIL_FAILED"
      }
    });
  }

  public confirmEmail(email: String, code: String) : Promise<boolean> {

    console.debug("[account-service] Sendng confirm request for email {"+email+"} with code {"+code+"}...");

    return this.mutate<{confirmAccountEmail: boolean}>({
      mutation: ConfirmEmailMutation,
      variables: {
        email: email,
        code: code
      }, 
      error: {
        code: ErrorCodes.CONFIRM_EMAIL_FAILED, 
        message: "ERROR.CONFIRM_ACCOUNT_EMAIL_FAILED"
      }
    })
    .then(res => res && res.confirmAccountEmail);
  }

  public listenChanges() : Subscription {
    if (!this.data.pubkey) return Subscription.EMPTY;

    const self = this;

    return this.apollo.subscribe({
      query: gql`
        subscription updateAccount($pubkey: String, $interval: Int){
          updateAccount(pubkey: $pubkey, interval: $interval) {
            id
            updateDate
          }
        }`,
      variables: {
        pubkey: this.data.pubkey,
        interval: 10
      }
    }).subscribe({
      next ({data, errors}) {
        if (data && data.updateAccount) {
          const updateDate = data.updateAccount.updateDate;
          if (self.data.account && self.data.account.updateDate !== updateDate) {
            console.debug("[account] [WS] Account updated at {" + updateDate + "}", data.updateAccount);
            self.refresh();
          }
        }
      },
      error(err) {
        console.log("[account] [WS] Received error:", err);
      }
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
