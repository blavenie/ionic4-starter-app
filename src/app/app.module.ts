
import "./vendor";

import {APP_BASE_HREF} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {SplashScreen} from "@ionic-native/splash-screen";
import {StatusBar} from "@ionic-native/status-bar";
import {Keyboard} from "@ionic-native/keyboard";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpLinkModule, HttpLink} from "apollo-angular-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {ApolloModule, Apollo} from "apollo-angular";
import {TranslateModule, TranslateService, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {ToolbarComponent} from "./toolbar/toolbar";
import {ReactiveFormsModule} from "@angular/forms";


import {AppRoutingModule} from './app-routing.module';
import {AppMaterialModule} from "./material/material.module";
import {AuthGuard} from "../services/auth-guard";
import {AuthForm} from "../pages/auth/form/form-auth";
import {AuthModal} from "../pages/auth/modal/modal-auth";
import {AccountService} from "../services/account-service";
import {TripService} from "../services/trip-service";
import {PersonService} from "../services/person-service";
import {CryptoService} from "../services/crypto-service";
import {MyApp} from "./app.component";
import {HomePage} from "../pages/home/home";
import {RegisterConfirmPage} from "../pages/register/confirm/confirm";
import {UsersPage} from "../pages/users/users";
import {TripPage} from "../pages/trip/trip";
import {TripForm} from "../pages/trip/form/form-trip";
import {TripModal} from "../pages/trip/modal/modal-trip";
import {TripsPage} from "../pages/trips/trips";
import {TripValidatorService} from "../pages/trips/validator/validators";
import {AutofocusDirective} from "../directives/autofocus/autofocus.directive";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material";
import {RegisterForm} from "../pages/register/form/form-register";
import {RegisterModal} from "../pages/register/modal/modal-register";
import { PersonValidatorService } from "../pages/users/validator/validators";

const conf = require('../lib/conf.js')


// Cordova plugins

// GraphQL imports

// Translation

// Components

// Auth

// Service

// Pages

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}




@NgModule({
  declarations: [
    MyApp,
    ToolbarComponent,
    HomePage,
    // Directives
    AutofocusDirective,
    // Auth & Register
    AuthForm,
    AuthModal,
    RegisterForm,
    RegisterModal,
    RegisterConfirmPage,
    // Users
    UsersPage,
    // Data
    TripForm,
    TripPage,
    TripsPage,
    TripModal
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpLinkModule,
    ApolloModule,
    ReactiveFormsModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AppMaterialModule,
    AppRoutingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    TripModal,
    AuthModal,
    RegisterModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Keyboard,
    AuthGuard,
    {provide: APP_BASE_HREF, useValue: '/'},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: MAT_DATE_FORMATS, useValue: {
        parse: {
          dateInput: 'DD/MM/YYYYTHH:MM:SSZ'
        },
        display: {
          dateInput: 'DD/MM/YYYY HH:MM',
          monthYearLabel: undefined,
          dateA11yLabel: '',
          monthYearA11yLabel: ''
        }
    }},
    // Common services
    CryptoService,
    AccountService,
    // Users services
    PersonService,
    PersonValidatorService,
    // Data services
    TripValidatorService,
    TripService
  ]
})
export class AppModule {

  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
    translate: TranslateService,
    adapter: DateAdapter<any>
  ) {
    console.info("[app] Creating app module...");
    apollo.create({
      link: httpLink.create({ uri: conf.baseUrl + '/graphql' }),
      cache: new InMemoryCache({
        /*dataIdFromObject: object => {
          switch (object.__typename) {
            case 'foo': return object.key; // use `key` as the primary key
            case 'bar': return `bar:${object.blah}`; // use `bar` prefix and `blah` as the primary key
            default: 
             let key  = defaultDataIdFromObject(object);
              console.log("dataIdFromObject", object, object.__typename, key);
              return key; // fall back to default handling
          }
        }*/
      })
    });

    const defaultLocale = 'en';
    var lang = translate.getBrowserLang();
    if (lang != 'en' && lang != 'fr') {
      lang = defaultLocale;
    }

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(lang);

    translate.onLangChange.subscribe(event => {
      if (event && event.lang) {
        console.debug('[app] Use locale [' +  event.lang + ']');
        adapter.setLocale(event.lang);
      }
    });

  }
}
