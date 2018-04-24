import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from "../services/auth-guard";
import {HomePage} from "../pages/home/home";
import {TripPage} from "../pages/trip/trip";
import {TripsPage} from "../pages/trips/trips";
import { UsersPage } from '../pages/users/users';
import { RegisterConfirmPage } from '../pages/register/confirm/confirm';


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

  // Users
  {
    path: 'users',
    component: UsersPage,
    canActivate:[AuthGuard]
  },

  // Data
  {
    path: 'trips',
    component: TripsPage,
    canActivate:[AuthGuard]
  },
  {
    path: 'trip/:id',
    component: TripPage,
    canActivate:[AuthGuard]
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
