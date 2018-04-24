import {TableDataSource, ValidatorService} from "angular4-material-table";
import {Observable, Subject} from "rxjs";
import {DataService} from "../../services/data-service";
import {EventEmitter} from "@angular/core";

export class AppTableDataSource<T, F> extends TableDataSource<T> {

  public onLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * Creates a new TableDataSource instance, that can be used as datasource of `@angular/cdk` data-table.
   * @param data Array containing the initial values for the TableDataSource. If not specified, then `dataType` must be specified.
   * @param dataService A service to load and save data
   * @param dataType Type of data contained by the Table. If not specified, then `data` with at least one element must be specified.
   * @param validatorService Service that create instances of the FormGroup used to validate row fields.
   * @param config Additional configuration for table.
   */
  constructor(dataType: new () => T,
              private dataService: DataService<T, F>,
              validatorService?: ValidatorService,
              config?: {
                prependNewElements: boolean;
              }) {
    super([], dataType, validatorService, config);
  };

  load(offset: number,
       size: number,
       sortBy?: string,
       sortDirection?: string,
       filter?: F): Observable<T[]> {

    this.onLoading.emit(true);
    let result = new Subject<T[]>();
    let subscription = this.dataService.loadAll(offset, size, sortBy, sortDirection, filter)
      .subscribe(rows => {
        this.onLoading.emit(false);
        this.updateDatasource(rows);
        result.next(rows);
        subscription.unsubscribe();
      },
      err => this.handleError(err, 'Unable to load trips'))
      ;
    return result.asObservable();
  }

  save() {
    let result = new Subject<T[]>();
    this.connect().subscribe(rows => {
      const rowsToSave: T[] = rows
        .map(r => r.currentData)
        .filter(t => ((t['id'] !== 0 && t['id'] === undefined) || t['dirty']));
      if (rowsToSave.length > 0) {
        let sub = this.dataService.saveAll(rowsToSave)
          .subscribe(res => {
            console.debug("[datasource] service.save() return:", res);
            // TODO: update element from res
            result.next(rowsToSave);
            sub.unsubscribe();
          })
      }
      else {
        result.next([]);
      }
    });

    return result.asObservable();
  }

  public handleError(error: any, message: string): Observable<T[]> {
    console.error(error);
    this.onLoading.emit(false);
    return Observable.throw(message);
  }
}
