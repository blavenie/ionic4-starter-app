import {Injectable} from "@angular/core";
import {WalletService} from "./wallet-service";
import {Apollo} from "apollo-angular";
import {ApolloQueryResult} from "apollo-client";
import {Observable} from "rxjs";


export declare class Referential {
  id: number;
  label: string;
  name: string;
}

@Injectable()
export class ReferentialService {

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

  getReferential(options): Observable<ApolloQueryResult<Referential>> {
    return null;
  }
}
