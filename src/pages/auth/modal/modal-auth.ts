import { Component, ViewChild } from '@angular/core';
import {ViewController} from 'ionic-angular';
import {AccountService} from "../../../services/account-service";
import { AuthForm } from '../form/form-auth';

@Component({
  selector: 'modal-auth',
  templateUrl: 'modal-auth.html',
})
export class AuthModal {

  loading: boolean = false;
  error: string;

  @ViewChild('form') private form: AuthForm;

  constructor(private accountService: AccountService,
              public viewCtrl: ViewController) {
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  doSubmit(): Promise<any> | void {
    if (!this.form.valid) return;
    this.loading = true;

    return this.accountService.login(this.form.value)
      .then((account) => {
        console.log("Will close auth modal");
        this.viewCtrl.dismiss(account);
      })
      .catch(err => {
        this.loading = false;
        this.form.error = err && err.message || err;
      });
  }
}
