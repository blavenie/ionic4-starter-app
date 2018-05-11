import {Injectable} from "@angular/core";
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import {Observable, Subject} from "rxjs";
import {Trip} from "./model";
import {DataService, BaseDataService} from "./data-service";
import {map} from "rxjs/operators";
import { Moment } from "moment";
import { DocumentNode } from "graphql";

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
const LoadAllQuery: DocumentNode = gql`
  query Trips($startDate: Date, $offset: Int, $size: Int, $sortBy: String, $sortDirection: String){
    trips(filter: {startDate: $startDate}, offset: $offset, size: $size, sortBy: $sortBy, sortDirection: $sortDirection){
      id
      departureDateTime
      returnDateTime
      creationDate
      updateDate
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
      vesselFeatures {
        vesselId,
        name,
        exteriorMarking
      }
    }
  }
`;
const LoadQuery: DocumentNode = gql`
  query Trip($id: Int) {
    trip(id: $id) {
      id
      departureDateTime
      returnDateTime
      creationDate
      updateDate
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
      vesselFeatures {
        vesselId
        name
        exteriorMarking
      }
    }
  }
`;
const SaveTrips: DocumentNode = gql`
  mutation saveTrips($trips:[TripVOInput]){
    saveTrips(trips: $trips){
      id
      updateDate
    }
  }
`;

@Injectable()
export class TripService extends BaseDataService implements DataService<Trip, TripFilter>{

  constructor(
    protected apollo: Apollo
  ) {
    super(apollo);
  }

  /**
   * Load many trips
   * @param offset 
   * @param size 
   * @param sortBy 
   * @param sortDirection 
   * @param filter 
   */
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
    return this.apollo.query<{trips: Trip[]}, TripsVariables>({
      query: LoadAllQuery,
      variables: variables
    })
    .pipe(
      map(({data}) => (data && data.trips || []).map(t => {
          const res = new Trip();
          console.log(t);
          res.fromObject(t);
          return res;
        })));
  }

  load(id: number): Promise<Trip|null> {
    console.debug("[trip-service] Loading trip {" + id+ "}...");

    return this.query<{trip: Trip}>({
      query: LoadQuery,
      variables: {
        id: id
      }
    })
    .then(data => {
      if (data && data.trip) {
        const res = new Trip();
        res.fromObject(data.trip);
        console.debug("[trip-service] Loaded trip {" + id+ "}", res);
        return res;
      }
      return null;
    });
  }

  /**
   * Save many trips
   * @param data 
   */
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
