import {Component, OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../services/account-service';
import {Location} from '@angular/common';

@Component({
  selector: 'page-registrer-confirm',
  templateUrl: 'confirm.html'
})
export class RegisterConfirmPage implements OnDestroy {

  isLogin: boolean;
  subscriptions: Subscription[] = [];
  loading: boolean = true;
  error: String;
  email: String;

  constructor(
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private location: Location) {
      this.isLogin = accountService.isLogin();
  
      // Subscriptions
      this.subscriptions.push(this.accountService.onLogin.subscribe(account => this.isLogin = true));
      this.subscriptions.push(this.accountService.onLogout.subscribe(() => this.isLogin = false));
      this.subscriptions.push(this.activatedRoute.paramMap.subscribe(params => 
        this.doConfirm(params.get("email"), params.get("code"))
      ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  doConfirm(email: String, code: String) {
    this.email = email;

    if (!code) {
      this.loading = false;
      this.error = null;
      return;
    }
    
    if (this.accountService.isLogin()) {
      let emailAccount = this.accountService.account && this.accountService.account.email
      if (email != emailAccount) {      
        // Not same email => logout, then retry
        return this.accountService.logout()
          .then(() => this.doConfirm(email, code));
      }
    }

    // Send the confirmation code
    this.accountService.confirmEmail(email, code)
      .then(confirmed => {
        if (confirmed && this.isLogin) {
          return this.accountService.refresh();
        }
      })
      .then(() => {
        this.loading = false;
        //this.location.replaceState("/confirm/" + email + "/");
      })
      .catch(err => {
        this.error = err && err.message || err;
        this.loading = false;
      });

  }
}
