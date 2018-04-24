import {Component, OnDestroy} from '@angular/core';
import {DatePipe} from "@angular/common";
import { ActivatedRoute } from '@angular/router';
import { ModalController } from 'ionic-angular';
import { RegisterModal } from '../register/modal/modal-register';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account-service';
import { Account  } from '../../services/model';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {

  bgImage: String;
  displayName: String = '';
  isLogin: boolean;
  subscriptions: Subscription[] = [];

  constructor(
    public accountService: AccountService,
    public activatedRoute: ActivatedRoute,
    public modalCtrl: ModalController
  ) {
    this.bgImage = this.getRandomImage();
    this.isLogin = accountService.isLogin();
    if (this.isLogin) {
      this.onLogin(this.accountService.account);
    }

    // Subscriptions
    this.subscriptions.push(this.accountService.onLogin.subscribe(account => this.onLogin(account)));
    this.subscriptions.push(this.accountService.onLogout.subscribe(() => this.onLogout()));
  };

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  onLogin(account: Account) {
    console.log('[home] Logged account: ', account);
    this.isLogin = true;
    this.displayName = account && 
    ((account.firstName && (account.firstName + " ") || "") +
    (account.lastName || "")) || "";
  }

  onLogout() {
    console.log('[home] Logout');
    this.isLogin = false;
    this.displayName = "";
  }

  getRandomImage() {
    const datePipe = new DatePipe('en-US');
    const now = Date.now();

    var imageCountByKind = {
      'ray': 7,
      'spring': 0,
      'summer': 0,
      'autumn': 0,
      'winter': 0
    };

    var kind;
    // Or landscape

    if (Math.random() < 0.5) {
      kind = 'ray';
    }
    else {
      const day = parseInt(datePipe.transform(now, 'D'));
      const month = parseInt(datePipe.transform(now, 'M'));
      if ((month < 3) || (month == 3 && day < 21) || (month == 12 && day >= 21)) {
        kind = 'winter';
      }
      else if ((month == 3 && day >= 21) || (month < 6) || (month == 6 && day < 21)) {
        kind = 'spring';
      }
      else if ((month == 6 && day >= 21) || (month < 9) || (month == 9 && day < 21)) {
        kind = 'summer';
      }
      else {
        kind = 'autumn';
      }
    }
    var imageCount = imageCountByKind[kind];
    if (imageCount == 0) return this.getRandomImage();
    var imageIndex = Math.floor(Math.random()*imageCount)+1;
    return './assets/img/bg/'+kind+'-' + imageIndex +'.jpg';
  }

  register() {
    let modal = this.modalCtrl.create(RegisterModal);
    modal.present();
  }

  logout(event: any) {
    this.accountService.logout();
  }

}
