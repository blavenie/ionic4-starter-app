import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from "../services/auth-guard";
import {HomePage} from "../pages/home/home";
import {TripPage} from "../pages/trip/trip";
import {TripsPage} from "../pages/trips/trips";
import { UsersPage } from '../pages/users/users';
import { RegisterConfirmPage } from '../pages/register/confirm/confirm';
import { AccountPage } from '../pages/account/account';


const routes: Routes = [
  {
    path: '',    
    component: HomePage
  },
  {
    path: 'home/:action',
    component: HomePage
  },

  // Register
  {
    path: 'confirm/:email/:code',
    component: RegisterConfirmPage
  },

  // Account
  {
    path: 'account',
    component: AccountPage,
    canActivate:[AuthGuard]
  },

  // Users
  {
    path: 'users',
    component: UsersPage,
    canActivate:[AuthGuard]
  },

  // Data: Trips, ...
  {
    path: 'trips',
    canActivate:[AuthGuard],
    children: [
      { path: '', component: TripsPage },
      { path: ':id', component: TripPage }
    ]
  },
  {
    path: "**",
    redirectTo: '/'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
