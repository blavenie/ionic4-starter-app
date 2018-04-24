import { Component, ViewChild } from '@angular/core';
import {Platform, Nav, MenuController} from "ionic-angular";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';


import {Router} from "@angular/router";
import {Account} from "../services/model";
import {AccountService} from "../services/account-service";

const conf = require('../lib/conf.js')

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

@Component({
  templateUrl: 'app.component.html'
})
export class MyApp {

  private isLogin: boolean;
  private account: Account;
  private appMenuItems: Array<MenuItem> =  [
    {title: 'MENU.HOME', path: '/', icon: 'home'},
    {title: 'MENU.TRIPS', path: '/trips', icon: 'pin'},
    {title: 'MENU.USERS', path: '/users', icon: 'people'}
  ];

  appVersion: String = conf.version;

  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, keyboard: Keyboard,
              private accountService: AccountService,
              private router: Router,
              public menu: MenuController) {


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      statusBar.overlaysWebView(false);

      //*** Control Keyboard
      keyboard.disableScroll(true);

      this.isLogin = accountService.isLogin();
      if (this.isLogin) {
        this.onLogin(this.accountService.account);
      }      

      // subscriptions
      this.accountService.onLogin.subscribe(account => this.onLogin(account));
      this.accountService.onLogout.subscribe(() => this.onLogout());

    });
  }

  onLogin(account: Account) {
    console.log('[app] Logged account: ', account);
    this.account = account;
    this.isLogin = true;
  }

  onLogout() {
    console.log("[app] logout");
    this.isLogin = false;
    this.account = null;
    this.router.navigate(['']);
  }

  logout(): void {
    this.account = null;
    this.accountService.logout();
  }

  openPage(page): void {
    // close the menu when clicking a link from the menu
    this.menu.close();

    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.router.navigate([page.path], page.params)
  }

}

