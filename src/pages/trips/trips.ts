import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import gql from 'graphql-tag';
import {Observable} from "rxjs";
import {Apollo} from "apollo-angular";

const Users = gql`
  query {
    users{
      id
      firstName
      lastName
    }
  }
`;
/**
 * Generated class for the TripsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html',
})
export class TripsPage implements CanActivate, OnInit{

  loading: boolean;
  data: Observable<any>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private apollo: Apollo) {
    this.loading = true;
  }

  ngOnInit() {
    this.data = this.apollo.watchQuery({ query: Users })
      .valueChanges;

    this.data.subscribe(({data}) => {
      this.loading = data.loading;
    });
  }

  canActivate(  next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
  {
    alert("Unauthorized Access,Redirecting to Home");
    this.router.navigate(['']);  // redirect to home
    return false;
  }
}
