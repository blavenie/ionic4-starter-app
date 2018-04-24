import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Referential} from "./model";
import {DataService} from "./data-service";


export declare class ReferentialFilter {
  type: string;
}

@Injectable()
export class ReferentialService implements DataService<Referential, ReferentialFilter>{

  constructor(
  ) {
  }


  loadAll( offset: number,
    size: number,
    sortBy?: string,
    sortDirection?: string,
    filter?: ReferentialFilter): Observable<Referential[]> {

    return Observable.empty();
  }

  saveAll(data: Referential[]): Observable<Referential[]> {
    return Observable.empty();
  }
}
