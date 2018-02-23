import {Component, EventEmitter, Injectable, OnInit, Output, ViewChild} from "@angular/core";
import gql from "graphql-tag";
import {Apollo} from "apollo-angular";
import {MatPaginator, MatSort} from "@angular/material";
import {merge} from "rxjs/observable/merge";
import {of as observableOf} from "rxjs/observable/of";
import {catchError} from "rxjs/operators/catchError";
import {map} from "rxjs/operators/map";
import {startWith} from "rxjs/operators/startWith";
import {switchMap} from "rxjs/operators/switchMap";
import {TableDataSource, ValidatorService} from "angular4-material-table";
import {UserValidatorService} from "./validator/validators";
import {FormControl, FormGroup, Validators} from "@angular/forms";

const Users = gql`
  query {
    users(name: "Bob"){
      id
      name
    }
  }
`;
/**
 * Generated class for the TripsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class User {
  name: string;
  id: number;
}

@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html',
  providers: [
    {provide: ValidatorService, useClass: UserValidatorService }
  ],
})
export class TripsPage implements OnInit{

  displayedColumns = ['firstName', 'lastName', 'actionsColumn'];
  dataSource:TableDataSource<User>;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output()
  listChange = new EventEmitter<User[]>();

  constructor(private apollo: Apollo,
              private userValidatorService: UserValidatorService) {
  };


  ngOnInit() {

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange,
        this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          console.log('sort: ', this.sort.active, this.sort.direction);
          //this.sort.active, this.sort.direction, this.paginator.pageIndex

          return this.apollo.watchQuery({ query: Users })
            .valueChanges;
        }),
        map(({data})=> {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data.users.length < this.paginator.pageSize;
          this.resultsLength = this.paginator.pageIndex * this.paginator.pageSize + data.users.length;

          return data.users;
        }),
        catchError((err) => {
          console.error(err);
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          this.resultsLength = 0;
          return observableOf([]);
        })
      ).subscribe(data => {
        this.dataSource = new TableDataSource<any>(data, User, this.userValidatorService);
        this.dataSource.datasourceSubject.subscribe(data => this.listChange.emit(data));
      });
  }

}

