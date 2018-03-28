import {Component, EventEmitter, OnInit, Output, ViewChild} from "@angular/core";
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import {MatPaginator, MatSort, Sort} from "@angular/material";
import {merge} from "rxjs/observable/merge";
import {of as observableOf} from "rxjs/observable/of";
import {catchError} from "rxjs/operators/catchError";
import {map} from "rxjs/operators/map";
import {startWith} from "rxjs/operators/startWith";
import {switchMap} from "rxjs/operators/switchMap";
import {TableDataSource, ValidatorService} from "angular4-material-table";
import {TripValidatorService} from "./validator/validators";
import { ApolloQueryResult } from 'apollo-client';
import {TripService, Trip, TripResult} from "../../services/trip-service"
import {LoadingController, Loading} from "ionic-angular";
import {Referential} from "../../services/referential-service";
import {Observable} from "rxjs";
import {SelectionModel} from "@angular/cdk/collections";


@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html',
  providers: [
    {provide: ValidatorService, useClass: TripValidatorService }
  ],
})
export class TripsPage implements OnInit{

  any: any;
  displayedColumns = ['select', 'id',
    'departureDateTime', 'departureLocation',
    'returnDateTime',  //'returnLocation',
    'comments',  'actionsColumn'];
  dataSource:TableDataSource<Trip>;
  resultsLength = 0;
  loading = true;
  dirty = false;
  isRateLimitReached = false;
  locations = [
    {id: 1,name: 'Brest'},
    {id: 2,name: 'Boulogne'}
  ];
  selection = new SelectionModel<Trip>(true, []);
  filteredLocations: Observable<Referential[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output()
  listChange = new EventEmitter<Trip[]>();

  constructor(private tripValidatorService: TripValidatorService,
              private tripService: TripService
  ) {
  };


  ngOnInit() {

    this.loading = true;

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange,
        this.paginator.page)
      .pipe(
        startWith({}),
        switchMap((any:any) => {
          this.loading = true;
          var options = {
            offset: this.paginator.pageIndex * this.paginator.pageSize,
            size: this.paginator.pageSize,
            sortBy: null,
            sortDirection: null
          };
          if (this.sort && this.sort.active) {
            options.sortBy = this.sort.active;
            options.sortDirection = this.sort.direction;
          }

          return this.tripService.getTrips(options);
        }),
        catchError((err) => {
          console.error(err);
          return observableOf({data: null, loading: false});
        })
      ).subscribe(({ data, loading }) => {
        this.loading = loading ;
        var trips;
        if (data) {
          this.isRateLimitReached = data.trips.length < this.paginator.pageSize;
          this.resultsLength = this.paginator.pageIndex * this.paginator.pageSize + data.trips.length;
          if (this.paginator.pageIndex == 0 && data.trips.length == 0) {
            trips = [{}];
          }
          else {
            console.debug('[trips] Loaded ' + data.trips.length + ' trips: ', data.trips);
            trips = data.trips;
          }

        }
        else {
          this.isRateLimitReached = true;
          this.resultsLength = 0;
          trips = [{}];
        }
        this.dataSource = new TableDataSource<Trip>(trips, Trip, this.tripValidatorService);
        this.dataSource.datasourceSubject.subscribe(data => this.listChange.emit(data));
        console.log(this.dataSource);
      });

    this.listChange.subscribe(event => this.onDataChanged(event));
  }

  confirmAndAddRow(row) {
    // create
    var valid = false;
    if (row.id<0) {
      valid = this.dataSource.confirmCreate(row);
    }
    // update
    else {
      valid = this.dataSource.confirmEdit(row);
    }
    if (!valid) {
      return false;
    }

    // Add new row
    this.dataSource.createNew();
    this.resultsLength++;
    return true;
  }

  cancelOrDelete(row) {
    // create
    this.resultsLength--;
    row.cancelOrDelete();
  }

  addRow() {
    // Add new row
    this.dataSource.createNew();
    this.dirty = true;
    this.resultsLength++;
  }

  editRow(row) {
    if (!row.editing) {
      console.log(row);
      row.startEdit();
    }
  }

  sortData(sort: Sort) {

  }


  createTrip() {
    var trip = new Trip();
    trip.departureLocation = new Referential();
    trip.returnLocation = new Referential();
    return trip;
  }

  onDataChanged(data: Trip[]) {
    if (!this.dirty) {
      data.forEach(t => {
        if (!t.id) {
          this.dirty = true;
        }
      });
    }
    if (this.dirty) {
      console.log("[trips] trips changed:", data);
    }
  }

  save() {
    console.log("[trips] Saving...");
    this.tripService.saveTrips(this.dataSource.currentData)
      .subscribe(({ data }) => {
        console.log('got data', data);
      },(error) => {
        console.error('Error while saving trips', error);
      });
  }

  /*filterLocation(name: string): Referential[] {
    return this.locations.filter(option =>
    option.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }*/

  displayReferentialFn(ref?: Referential): string | undefined {
    return ref ? ref.name : undefined;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected == this.resultsLength;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.connect().forEach(row => {
        this.selection.select(row);
    });
  }
}

