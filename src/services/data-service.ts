import {ApolloQueryResult} from "apollo-client";
import {FetchResult} from "apollo-link";
import {Observable} from "rxjs";

export declare class RemoteService<T> {

  loadAll(options?: {
    offset?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Observable<ApolloQueryResult<T>>;

  saveAll(data: T[]): Observable<FetchResult<T>>;

}
