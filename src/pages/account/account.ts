import {Component, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account-service';
import { Account, StatusIds  } from '../../services/model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage implements OnDestroy {

  isLogin: boolean;
  subscriptions: Subscription[] = [];
  changesSubscriptions: Subscription[] = [];
  account: Account;
  email: any = {
    confirmed: false,
    notConfirmed: false,
    sending: false,
    error: undefined
  }
  error: String;
  public form: FormGroup;
  localeMap  = {
    'fr': 'Français',
    'en': 'English'
  };
  locales: String[] = [];


  constructor(
    public formBuilder: FormBuilder,              
    public accountService: AccountService,
    public activatedRoute: ActivatedRoute
  ) {
    this.form = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      settings: formBuilder.group({
        locale: ['', Validators.required]
      })
    });

    this.locales;
    for (let locale in this.localeMap) {
      this.locales.push(locale);
    }

    // Subscriptions
    this.subscriptions.push(this.accountService.onLogin.subscribe(account => this.onLogin(account)));
    this.subscriptions.push(this.accountService.onLogout.subscribe(() => this.onLogout()));

    if (accountService.isLogin()) {
      this.onLogin(this.accountService.account);
    }
  };

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    this.stopListenChanges();
  }

  onLogin(account: Account) {
    //console.debug('[account] Logged account: ', account);
    this.isLogin = true;
    this.account = account;
    this.email.confirmed = account && account.email && (account.statusId != StatusIds.TEMPORARY);
    this.email.notConfirmed = account && account.email && (!account.statusId || account.statusId == StatusIds.TEMPORARY);

    this.setValue(account);
    this.form.controls.email.disable();
    this.form.markAsPristine();

    this.startListenChanges();
  }

  onLogout() {
    //console.debug('[home] Logout');
    this.isLogin = false;
    this.email.confirmed = false;
    this.email.notConfirmed = false;
    this.email.sending = false;
    this.email.error = undefined;
    this.form.reset();
    this.form.controls.email.enable();
  }

  startListenChanges() {
    this.changesSubscriptions.forEach(s => s.unsubscribe());
    this.changesSubscriptions = [];
    this.changesSubscriptions.push(this.accountService.listenChanges());
  }

  stopListenChanges() {
    this.changesSubscriptions.forEach(s => s.unsubscribe());
    this.changesSubscriptions = [];
  }

  setValue(data: any) {
    let value = this.getValue(this.form, data);
    this.form.setValue(value);
  }

  getValue(form: FormGroup, data: any) {
    let value = {};
    form = form || this.form;
    for (let key in form.controls) {
      if (form.controls[key] instanceof FormGroup) {
        value[key] = this.getValue(form.controls[key] as FormGroup, data[key]);
      }
      else {
        value[key] = data[key] || null;
      }
    }
    return value;
  }

  sendConfirmationEmail(event: MouseEvent) {
    if (!this.account.email || !this.email.notConfirmed) {
      event.preventDefault();
      return false;
    }

    this.email.sending = true;
    console.debug("[account] Sending confirmation email...");
    this.accountService.sendConfirmationEmail(
      this.account.email,
      this.account.settings.locale
    )
    .then((res) => {
      console.debug("[account] Confirmation email sent.");
      this.email.sending = false;
    })
    .catch(err => {
      this.email.sending = false;
      this.email.error = err && err.message || err;
    });
  }

  doSave(event: MouseEvent, data: any) {
    if (this.form.invalid) return;

    let newAccount = this.account.clone();
    let json = newAccount.asObject();

    let settings = Object.assign({}, data.settings); // Need to be copied first
    Object.assign(json, data);
    json.settings = Object.assign(this.account.settings.asObject(), settings);
    newAccount.fromObject(json);

    console.log("[account] Updating account...", newAccount);
    this.accountService.saveRemotely(newAccount)
      .catch(err => this.error = err && err.message || err);
  }

  cancel(event: any) {
    this.setValue(this.account);
    this.form.markAsPristine();
  }
}
