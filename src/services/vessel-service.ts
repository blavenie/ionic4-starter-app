import {Injectable} from "@angular/core";
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import {Observable, Subject} from "rxjs";
import {Trip, VesselFeatures} from "./model";
import {DataService, BaseDataService} from "./data-service";
import {map} from "rxjs/operators";
import { Moment } from "moment";
import { DocumentNode } from "graphql";

export declare class VesselFilter {
  date?: Date|Moment;
  vesselId?: number;
}
export declare class VesselsVariables extends VesselFilter {
  offset: number;
  size: number;
  sortBy?: string;
  sortDirection?: string;
};
const LoadAllQuery: DocumentNode = gql`
  query Vessels($date: Date, $vesselId: Int, $offset: Int, $size: Int, $sortBy: String, $sortDirection: String){
    vessels(filter: {date: $date, vesselId: $vesselId}, offset: $offset, size: $size, sortBy: $sortBy, sortDirection: $sortDirection){
      id
      vesselId
      exteriorMarking
      administrativePower
      lengthOverAll
      creationDate
      updateDate
      vesselId
      comments
      basePortLocation {
        id
        label
        name
      }
    }
  }
`;
const LoadQuery: DocumentNode = gql`
  query Vessel($id: Int) {
    vessels(filter: {vesselId: $id}) {
      id
      vesselId
      exteriorMarking
      administrativePower
      lengthOverAll
      creationDate
      updateDate
      vesselId
      comments
      basePortLocation {
        id
        label
        name
      }
    }
  }
`;

@Injectable()
export class VesselService extends BaseDataService implements DataService<VesselFeatures, VesselFilter>{

  constructor(
    protected apollo: Apollo
  ) {
    super(apollo);
  }

  /**
   * Load many vessels
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
          filter?: VesselFilter): Observable<VesselFeatures[]> {
    const variables: VesselsVariables = {
      date: filter && filter.date || null,
      offset: offset || 0,
      size: size || 100,
      sortBy: sortBy || 'departureDateTime',
      sortDirection: sortDirection || 'asc'
    };
    console.debug("[vessel-service] Getting vessels using options:", variables);
    return this.apollo.query<{vessels: any[]}, VesselsVariables>({
      query: LoadAllQuery,
      variables: variables
    })
    .pipe(
      map(({data}) => (data && data.vessels || []).map(t => {
          const res = new VesselFeatures();
          res.fromObject(t);
          return res;
        })));
  }

  load(id: number): Promise<VesselFeatures|null> {
    console.debug("[vessel-service] Loading vessel " + id);

    return this.query<{vessels: any}>({
      query: LoadQuery,
      variables: {
        id: id
      }
    })
    .then(data => {
      if (data && data.vessels) {
        const res = new VesselFeatures();
        res.fromObject(data.vessels[0]);
        return res;
      }
      return null;
    });
  }

  /**
   * Save many vessels
   * @param data 
   */
  saveAll(data: VesselFeatures[]): Observable<VesselFeatures[]> {

    console.debug("[vessel-service] Saving vessels: ", data);
 
    return Observable.empty();

    /* let vesselsToSave = data && data
      .map(t => t.asObject());

      let subject = new Subject<Trip[]>();

    let subscription = this.apollo.mutate({
        mutation: SaveTrips,
        variables: {
          vessels: vesselsToSave
        }
      })
      .subscribe(({data}) => {
        data && data['saveTrips'] && vesselsToSave.forEach(t => {
          const res = data.saveTrips.find(res => res.id == t.id);
          t.updateDate = res && res.updateDate || t.updateDate;
        });
        subject.next(vesselsToSave);
        subscription.unsubscribe();
      });
    return subject.asObservable();*/
  }
}
