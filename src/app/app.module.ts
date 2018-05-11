
import "./vendor";

import {APP_BASE_HREF} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";
import {ErrorHandler, NgModule} from "@angular/core";
import {IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {SplashScreen} from "@ionic-native/splash-screen";
import {StatusBar} from "@ionic-native/status-bar";
import {Keyboard} from "@ionic-native/keyboard";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateModule, TranslateService, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {ToolbarComponent} from "./toolbar/toolbar";
import {ReactiveFormsModule} from "@angular/forms";

import {AppRoutingModule} from './app-routing.module';
import {AppMaterialModule} from "./material/material.module";
import {AppGraphQLModule} from "./graphql/graphql.module";

import {AuthGuard} from "../services/auth-guard";
import {AuthForm} from "../pages/auth/form/form-auth";
import {AuthModal} from "../pages/auth/modal/modal-auth";
import {AccountService} from "../services/account-service";
import {TripService} from "../services/trip-service";
import {PersonService} from "../services/person-service";
import {CryptoService} from "../services/crypto-service";
import {VesselService} from "../services/vessel-service";
import {MyApp} from "./app.component";
import {HomePage} from "../pages/home/home";
import {RegisterConfirmPage} from "../pages/register/confirm/confirm";
import {AccountPage} from "../pages/account/account";
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
import { Account } from "../services/model";


const conf = require("../lib/conf.js")

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
    AccountPage,
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
    AppGraphQLModule,
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
    TripService,
    VesselService
  ]
})
export class AppModule {

  constructor(
    private translate: TranslateService,
    accountService: AccountService,
    adapter: DateAdapter<any>
  ) {
    console.info("[app] Creating app module...");

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang(conf.defaultLocale);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    if (accountService.isLogin()) {
      this.useAccountLocale(accountService.account);
    }
    else {
      this.useBrowserOrDefaultLocale();
    }

    // Listen account events
    accountService.onLogin.subscribe(account => this.useAccountLocale(account));
    accountService.onLogout.subscribe(account => this.useBrowserOrDefaultLocale());

    // When locale changes, apply to date adapter
    translate.onLangChange.subscribe(event => {
      if (event && event.lang) {
        console.debug('[app] Use locale {' +  event.lang + '}');
        adapter.setLocale(event.lang);
      }
    });

  }

  useAccountLocale(account: Account) {
    if (account.settings && account.settings.locale != this.translate.currentLang) {
      this.translate.use(account.settings.locale);
    }
  }

  useBrowserOrDefaultLocale() {
    var lang = this.translate.getBrowserLang();
    this.useLocale(lang);
  }

  useLocale(lang: string) {
    if (lang != 'en' && lang != 'fr') {
      lang = conf.defaultLocale;
    }
    this.translate.use(lang);
  }
}
