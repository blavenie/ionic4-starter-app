
import {APP_BASE_HREF} from "@angular/common";
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {RouterModule, Routes} from "@angular/router";

// Cordova plugins
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';

// GraphQL imports
import { HttpClient, HttpClientModule} from '@angular/common/http';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloModule, Apollo } from 'apollo-angular';

// Translation
import { TranslateModule, TranslateService, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';

// Components
import {ToolbarComponent} from "./toolbar/toolbar";
import {AppMaterialModule} from "./material/material.module";

// Auth
import {AuthGuard} from "../services/auth-guard";
import {AuthForm} from "../pages/auth/form/form-auth";
import {AuthModalPage} from "../pages/auth/modal/modal-auth";

// Pages
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { TripPage } from '../pages/trip/trip';
import {TripsPage} from "../pages/trips/trips";
import {WalletService} from "../services/wallet-service";
import {UserValidatorService} from "../pages/trips/validator/validators";
import {TableDataSource} from "angular4-material-table";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}



const routes: Routes = [
  {
    path: '',
    component: HomePage,
    data: { title: 'Titre 1' }
  },
  {
    path: 'trips',
    component: TripsPage,
    data: { title: 'Trips title' },
    canActivate:[AuthGuard]
  },
  {
    path: 'trip/:id',
    component: TripPage,
    data: { title: 'Titre 2' }
  }
];


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TripPage,
    TripsPage,
    ToolbarComponent,
    AuthForm,
    AuthModalPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpLinkModule,
    ApolloModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    RouterModule.forRoot(routes),
    AppMaterialModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TripPage,
    TripsPage,
    ToolbarComponent,
    AuthForm,
    AuthModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Keyboard,
    AuthGuard,
    {provide: APP_BASE_HREF, useValue: '/#/'},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    WalletService,
    UserValidatorService
  ]
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
    translate: TranslateService
  ) {
    apollo.create({
      link: httpLink.create({ uri: 'http://localhost:4000/graphql' }),
      cache: new InMemoryCache()
    });

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
  }
}

