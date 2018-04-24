import { Component, ViewChild } from '@angular/core';
import {ViewController} from 'ionic-angular';
import {AccountService} from "../../../services/account-service";
import { RegisterForm } from '../form/form-register';

@Component({
  selector: 'modal-register',
  templateUrl: 'modal-register.html',
})
export class RegisterModal {

  sending: boolean = false;

  @ViewChild('form') private form: RegisterForm;

  constructor(private accountService: AccountService,
              public viewCtrl: ViewController) {
  }

  cancel() {
    console.debug('[register] cancelled');
    this.viewCtrl.dismiss();
  }

  doSubmit(event:any) {
    if (!this.form.valid || !this.form.isEnd()) return;

    this.sending = true;
    let data = this.form.value;
    this.accountService.register(data)
      .then(() =>  {
        console.debug('[register] account registered. Closing modal...');
        this.sending = true;
        return this.viewCtrl.dismiss();
      })
      .catch(err => {
        this.form.error = err && err.message || err;
        this.sending = false;
      });
  }
}
