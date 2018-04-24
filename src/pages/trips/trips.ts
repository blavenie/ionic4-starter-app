import {Component, EventEmitter, OnInit, Output, ViewChild, OnDestroy} from "@angular/core";
import {MatPaginator, MatSort} from "@angular/material";
import {merge} from "rxjs/observable/merge";
import {startWith, switchMap} from "rxjs/operators";
import {ValidatorService, TableElement} from "angular4-material-table";
import {AppTableDataSource} from "../../app/material/material.table";
import {TripValidatorService} from "./validator/validators";
import {TripService, TripFilter} from "../../services/trip-service";
import {SelectionModel} from "@angular/cdk/collections";
import {TripModal} from "../trip/modal/modal-trip";
import {Trip, Referential} from "../../services/model";
import {Subscription} from "rxjs";
import { ModalController } from "ionic-angular";

@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html',
  providers: [
    {provide: ValidatorService, useClass: TripValidatorService }
  ],
})
export class TripsPage implements OnInit, OnDestroy {

  any: any;
  subscriptions: Subscription[] = [];
  displayedColumns = ['select', 'id',
    'departureDateTime', 'departureLocation',
    'returnDateTime',  //'returnLocation',
    'comments'];
  dataSource:AppTableDataSource<Trip, TripFilter>;
  resultsLength = 0;
  loading = true;
  showFilter = false;
  dirty = false;
  isRateLimitReached = false;
  locations: Referential[] = [
    new Referential({id: 1, label: 'XBR', name: 'Brest'}),
    new Referential({id: 2, label: 'XBL', name: 'Boulogne'})
  ];
  selection = new SelectionModel<TableElement<Trip>>(true, []);
  selectedRow: TableElement<Trip> = undefined;
  onRefresh: EventEmitter<any> = new EventEmitter<any>();
  filter: TripFilter = {
    startDate: null,
    endDate: null
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output()
  listChange = new EventEmitter<Trip[]>();

  constructor(//private dialog: MatDialog,
              private tripValidatorService: TripValidatorService,
              private tripService: TripService,
              private modalCtrl: ModalController
  ) {
    this.dataSource = new AppTableDataSource<Trip, TripFilter>(Trip, this.tripService, this.tripValidatorService);
  };

  ngOnInit() {

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(
      this.sort.sortChange,
      this.paginator.page,
      this.onRefresh
    )
      .pipe(
        startWith({}),
        switchMap((any:any) => {
          this.dirty = false;
          this.selection.clear();
          this.selectedRow = null;
          return this.dataSource.load(
            this.paginator.pageIndex * this.paginator.pageSize,
            this.paginator.pageSize || 10,
            this.sort.active,
            this.sort.direction,
            this.filter
          );
        })
      )
      .subscribe(data => {
        if (data) {
          this.isRateLimitReached = data.length < this.paginator.pageSize;
          this.resultsLength = this.paginator.pageIndex * this.paginator.pageSize + data.length;
          console.debug('[trips] Loaded ' + data.length + ' trips: ', data);
        }
        else {
          console.debug('[trips] Loaded NO trips');
          this.isRateLimitReached = true;
          this.resultsLength = 0;
        }
      });

    // Subscriptions:
    this.subscriptions.push(this.dataSource.onLoading.subscribe(loading => this.loading = loading));
    this.subscriptions.push(this.dataSource.datasourceSubject.subscribe(data => this.listChange.emit(data)));
    this.subscriptions.push(this.listChange.subscribe(event => this.onDataChanged(event)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  confirmAndAddRow(row: TableElement<Trip>) {
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

  createTrip() {
    var trip = new Trip();
    return trip;
  }

  onDataChanged(data: Trip[]) {
    data.forEach(t => {
      if (!t.id && !t.dirty) {
        t.dirty = true;
      }
    });
    if (this.dirty) {
      console.debug("[trips] trips changed:");
    }
  }

  save() {
    if (this.selectedRow && this.selectedRow.editing) {
      var confirm = this.selectedRow.confirmEditCreate();
      if (!confirm) return;
    }
    console.log("[trips] Saving...");
    this.dataSource.save().subscribe(res => {
      this.dirty = false;
    });    
  }

  displayReferentialFn(ref?: Referential): string | undefined {
    return ref ? (ref.label + ' - ' + ref.name) : undefined;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected == this.resultsLength;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle () {
    if (this.loading) return;
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.connect().subscribe(rows =>
        rows.forEach(row => this.selection.select(row))
      );
  }

  deleteSelection() {
    if (this.loading) return;
    this.selection.selected.forEach(row => {
      row.delete();
      this.selection.deselect(row);
      this.resultsLength--;
    });
    this.selection.clear();
  }

  onRowClicked(row) {
    if (this.selectedRow && this.selectedRow === row) return;
    if (this.selectedRow && this.selectedRow !== row && this.selectedRow.editing) {
      var confirm = this.selectedRow.confirmEditCreate();
      if (!confirm) {
        return;
      }
    }
    if (!row.editing && !this.loading) {
      row.startEdit();
      row.currentData.dirty = true;
    }
    this.selectedRow = row;
    this.dirty = true;
  }

  openTripModal() {
    if (this.loading) return;

    let modal = this.modalCtrl.create(TripModal);
    modal.present();
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }
}

