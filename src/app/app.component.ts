import { Component, ViewChild } from '@angular/core';
import {Platform, Nav, MenuController} from "ionic-angular";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';


import {Router} from "@angular/router";
import {WalletService} from "../services/wallet-service";

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

@Component({
  templateUrl: 'app.component.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  isLogin: boolean = false;
  appMenuItems: Array<MenuItem>;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, keyboard: Keyboard,
              private wallet: WalletService,
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


      this.isLogin = this.wallet.isLogin();
      this.wallet.onLogin.subscribe(event => this.onLogin(event));
      this.wallet.onLogout.subscribe(event => this.onLogout());
    });

    this.appMenuItems = [
      {title: 'Home', path: '', icon: 'home'},
      {title: 'Trips', path: 'trips', icon: 'home'}
    ];

  }

  onLogin(data): void {
    console.log(data);
    this.isLogin = true;
  }

  onLogout(): void {
    console.log("[app] logout");
    this.isLogin = false;
    this.router.navigate(['']);
  }

  logout(): void {
    this.wallet.logout();
  }



  openPage(page): void {
    // close the menu when clicking a link from the menu
    this.menu.close();

    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.router.navigate([page.path], page.params)
  }

}

