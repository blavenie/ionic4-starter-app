import {Injectable} from "@angular/core";
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import {ApolloQueryResult} from "apollo-client";
import {Observable, Subject} from "rxjs";
import {Trip} from "./model";
import {DataService} from "./data-service";
import {map} from "rxjs/operators";
import { Moment } from "moment";

export declare class TripFilter {
  startDate: Date|Moment;
  endDate: Date|Moment;
}
export declare class TripsVariables extends TripFilter {
  offset: number;
  size: number;
  sortBy?: string;
  sortDirection?: string;
};
export declare type TripsResult = {
  trips: Trip[];
}
const Trips = gql`
  query Trips($startDate: Date, $offset: Int, $size: Int, $sortBy: String, $sortDirection: String){
    trips(filter: {startDate: $startDate}, offset: $offset, size: $size, sortBy: $sortBy, sortDirection: $sortDirection){
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
      updateDate
    }
  }
`;

@Injectable()
export class TripService implements DataService<Trip, TripFilter>{

  constructor(
    private apollo: Apollo
  ) {
  }

  loadAll(offset: number,
          size: number,
          sortBy?: string,
          sortDirection?: string,
          filter?: TripFilter): Observable<Trip[]> {
    const variables: TripsVariables = {
      startDate: filter && filter.startDate || null,
      endDate: filter && filter.endDate || null,
      offset: offset || 0,
      size: size || 100,
      sortBy: sortBy || 'departureDateTime',
      sortDirection: sortDirection || 'asc'
    };
    console.debug("[trip-service] Getting trips using options:", variables);
    this.apollo.getClient().cache.reset();
    return this.apollo.query<ApolloQueryResult<TripsResult>, TripsVariables>({
      query: Trips,
      variables: variables
    })
    .pipe(
      map(
        ({data}) => (data && data['trips'] || []).map(t => {
          const res = new Trip();
          res.fromObject(t);
          return res;
        })));
  }

  saveAll(data: Trip[]): Observable<Trip[]> {

    console.debug("[trip-service] Saving trips: ", data);

    let tripsToSave = data && data
      .map(t => {
        const copy:any = t.asObject();
        copy.departureDateTime = copy.departureDateTime || copy.returnDateTime;
        copy.returnDateTime = copy.returnDateTime || copy.departureDateTime;
        //copy.departureLocation.id = copy.departureLocation.id || copy.returnLocation.id;
        //copy.returnLocation.id = copy.returnLocation.id || copy.departureLocation.id;
        copy.recorderDepartment.id = copy.recorderDepartment.id || 1; // FIXME make
        copy.vesselId = copy.vesselId || copy.vessel && copy.vessel.id;
        delete copy.vessel;
        return copy;
      });

    let subject = new Subject<Trip[]>();

    let subscription = this.apollo.mutate({
        mutation: SaveTrips,
        variables: {
          trips: tripsToSave
        }
      })
      .subscribe(({data}) => {
        data && data['saveTrips'] && tripsToSave.forEach(t => {
          const res = data.saveTrips.find(res => res.id == t.id);
          t.updateDate = res && res.updateDate || t.updateDate;
        });
        subject.next(tripsToSave);
        subscription.unsubscribe();
      });
    return subject.asObservable();
  }
}
