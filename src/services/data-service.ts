import {Observable, Subscription} from "rxjs";
import { Apollo } from "apollo-angular";
import { GraphQLError, DocumentNode } from "graphql";
import { ApolloQueryResult } from "apollo-client";
import { R } from "apollo-angular/types";
import { ErrorCodes, ServiceError } from "./errors";


export declare interface DataService<T, F> {

  loadAll(
    offset: number,
    size: number,
    sortBy?: string,
    sortDirection?: string,
    filter?: F
  ): Observable<T[]>;

  saveAll(data: T[]): Observable<T[]>;
}


export class BaseDataService {

  constructor(
    protected apollo: Apollo
  ) {
    
  }

  protected query<T, V = R>(opts: {query: DocumentNode, variables: V, error?: ServiceError}): Promise<T> {
    this.apollo.getClient().cache.reset();
    return new Promise<T>((resolve, reject) => {
      const subscription: Subscription = this.apollo.query<ApolloQueryResult<T>, V>({
        query: opts.query,
        variables: opts.variables
      })
      .catch(this.onApolloError)      
      .subscribe(({data, errors}) => {  
          subscription.unsubscribe();

          if (errors) {
            if (errors[0].message == "ERROR.UNKNOWN_NETWORK_ERROR") {
              reject({
                code: ErrorCodes.UNKNOWN_NETWORK_ERROR,
                message: "ERROR.UNKNOWN_NETWORK_ERROR"
              });
              return;
            }
            console.error("[account] " + errors[0].message);
            reject(opts.error ? opts.error : errors[0].message);
            return;
          }
          resolve(data as T);
        });
    });
  }

  protected mutate<T, V = R>(opts: {mutation: DocumentNode, variables: V, error?: ServiceError}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let subscription = this.apollo.mutate<ApolloQueryResult<T>, V>({
        mutation: opts.mutation,
        variables: opts.variables
      })
      .catch(this.onApolloError)
      .subscribe(({data, errors}) => {
        if (errors) {
          if (errors[0].message == "ERROR.UNKNOWN_NETWORK_ERROR") {
            reject(errors[0]);
          }
          else {
            console.error("[base-service] " + errors[0].message);
            reject(opts.error ? opts.error : errors[0].message);
          }
        }
        else {
          resolve(data as T);
        }
        subscription.unsubscribe();
      });
    });
  }

  private onApolloError<T>(err: any): Observable<ApolloQueryResult<T>> {
    let result: ApolloQueryResult<T>;
    if (err && err.networkError) {
      console.error("[base-service] " + err.networkError.message);
      result = {
        data: null,
        errors: [new GraphQLError("ERROR.UNKNOWN_NETWORK_ERROR")],        
        loading: false,
        networkStatus: err.networkStatus,
        stale: err.stale
      };
    }
    else {
      result = {
        data: null,
        errors: [err as GraphQLError],        
        loading: false,
        networkStatus: err.networkStatus,
        stale: err.stale
      };
    }
    return Observable.of(result);
  }
}