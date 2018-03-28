import {Injectable,} from "@angular/core";
import {WalletService} from "./wallet-service"
import gql from "graphql-tag";
import {Apollo, ApolloBase} from "apollo-angular";
import {ApolloQueryResult, WatchQueryOptions} from 'apollo-client';
import { QueryRef } from 'apollo-angular';
import { FetchResult } from 'apollo-link';
import {Observable} from "rxjs";
import {DateTime} from "ionic-angular";
import {Referential} from "./referential-service";


export class Trip {
  id: number;
  departureDateTime: DateTime;
  returnDateTime: Date;
  comments: string;
  updateDate: DateTime;
  creationDate: DateTime;
  departureLocation: Referential;
  returnLocation: Referential;
  recorderDepartment: Referential;
  vessel: Referential;
  vesselId: number;
  constructor() {
    this.departureLocation = {};
    this.returnLocation = {};
  }
}
export declare type TripResult = {
  trips: Trip[];
}
export declare class TripFilter {
  startDate: Date;
  endDate: Date;
}


const Trips = gql`
  query Trips($offset: Int, $size: Int, $sortBy: String, $sortDirection: String){
    trips(offset: $offset, size: $size, sortBy: $sortBy, sortDirection: $sortDirection){
      id
      departureDateTime
      returnDateTime
      creationDate
      updateDate
      vesselId
      comments
      departureLocation {
        id
        label
        name
      }
      returnLocation {
        id
        label
        name
      }
      recorderDepartment {
        id
        label
        name
      }
    }
  }
`;
const SaveTrips = gql`
  mutation saveTrips($trips:[TripVOInput]){
    saveTrips(trips: $trips){
      id
    }
  }
`;

@Injectable()
export class TripService {

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

  getTrips(options): Observable<ApolloQueryResult<Trip>> {
    const variables = {
      offset: options && options.offset || 0,
      size: options && options.size || 100,
      sortBy: options && options.sortBy || "departureDateTime",
      sortDirection: options && options.sortDirection || "asc"
    };
    let obTrips: QueryRef<Trip> = this.apollo.watchQuery<Trip>({
      query: Trips,
      variables: variables
    });
    return obTrips.valueChanges;
  }

  saveTrips(trips: Trip[]): Observable<FetchResult<Trip>> {
    const tripsToSave = trips && trips
      //.filter(t => !t || !t.id || t.id < 0)
      .map(t => {
        return {
          departureDateTime: t.departureDateTime || t.returnDateTime,
          returnDateTime: t.returnDateTime || t.departureDateTime,
          departureLocation: {id: t.departureLocation.id||t.returnLocation.id},
          returnLocation: {id:t.returnLocation.id||t.departureLocation.id},
          recorderDepartment: {id: t.recorderDepartment && t.recorderDepartment.id || 1},
          vesselId: t.vessel && t.vessel.id || 1,
          creationDate: t.creationDate
        };
      });

    return this.apollo.mutate({
      mutation: SaveTrips,
      variables: {
        trips: tripsToSave
      }
    });
  }
}
