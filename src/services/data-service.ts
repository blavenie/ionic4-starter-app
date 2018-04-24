import {Observable} from "rxjs";

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
