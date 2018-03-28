import {EventEmitter, Injectable, Output} from "@angular/core";
import {WalletService} from "./wallet-service"
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import { ApolloQueryResult } from 'apollo-client';
import { QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';

const Users = gql`
  query {
    persons{
      id
      firstName
      lastName
    }
  }
`;
export declare class User {
  id: number;
  firstName: string;
  lastName: string;
}
export declare type UserResult = {
  users: User[];
}

@Injectable()
export class UserService {

  public data:any = {};

  constructor(
    private apollo: Apollo,
    private wallet: WalletService
  ) {
    this.resetData();

    this.wallet.onLogin.subscribe(event => this.onLogin(event));
    this.wallet.onLogout.subscribe(event => this.onLogout());
  }

  private resetData() {

  }

  private onLogin(data): void {
    // TODO user data ?
  }

  private onLogout(): void {
    this.resetData();
  }

  getUsers(options): Observable<ApolloQueryResult<UserResult>> {
    var obUsers:QueryRef<UserResult>;
    obUsers = this.apollo.watchQuery<UserResult>({ query: Users });
    return obUsers.valueChanges;
  }
}
