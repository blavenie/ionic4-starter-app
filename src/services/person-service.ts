import { Injectable } from "@angular/core";
import gql from "graphql-tag";
import { Apollo } from "apollo-angular";
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs/Observable';
import { Person } from './model';
import { DataService } from "./data-service";

// Load persons query
const PersonsQuery = gql`
  query Persons($email: String, $pubkey: String, $offset: Int, $size: Int, $sortBy: String, $sortDirection: String){
    persons(filter: {email: $email, pubkey: $pubkey}, offset: $offset, size: $size, sortBy: $sortBy, sortDirection: $sortDirection){
      id
      firstName
      lastName
      email
      pubkey
      avatar
      statusId
    }
  }
`;
export declare type PersonsQueryResult = {
  persons: Person[];
}
export declare class PersonFilter {
  email?: string;
  pubkey?: string;
};
export declare class PersonsVariables extends PersonFilter{
  offset: number;
  size: number;
  sortBy?: string;
  sortDirection?: string;
};


@Injectable()
export class PersonService implements DataService<Person, PersonFilter> {

  constructor(
    private apollo: Apollo
  ) {
  }

  /**
   * Load/search some persons
   * @param offset 
   * @param size 
   * @param sortBy 
   * @param sortDirection 
   * @param filter 
   */
  public loadAll( 
    offset: number,
    size: number,
    sortBy?: string,
    sortDirection?: string,
    filter?: PersonFilter
  ): Observable<Person[]> {

    const variables: PersonsVariables = {
      email: filter && filter.email || null,
      pubkey: filter && filter.pubkey || null,
      offset: offset || 0,
      size: size || 100,
      sortBy: sortBy || 'lastName',
      sortDirection: sortDirection || 'asc'
    };
    console.debug("[person-service] Loading persons, using filter: ", variables);
    this.apollo.getClient().cache.reset();
    return this.apollo.query<ApolloQueryResult<PersonsQueryResult>, PersonsVariables>({
      query: PersonsQuery,
      variables: variables
    })
    //.take(1)
    .map(
      //map(
        ({data}) => (data && data['persons'] || []).map(t => {
          const res = new Person();
          res.fromObject(t);
          return res;
        }));
      //));
  }

  /**
   * Saving many persons
   * @param data 
   */
  saveAll(data: Person[]): Observable<Person[]> {
    console.info("[person-service] Saving persons: ", data);
    console.warn('Not impklemented yet !');
    return Observable.empty();
  }
}
