import { Component } from '@angular/core';
import {MenuController, ViewController} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthForm} from "../form/form-auth";
import {WalletService} from "../../../services/wallet-service";

/**
 * Generated class for the AuthPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'modal-auth',
  templateUrl: 'modal-auth.html',
})
export class AuthModalPage {

  constructor(private router: Router,
              private wallet: WalletService,
              public viewCtrl: ViewController) {
  }

  cancel() {
    console.log('cancelled');
    this.viewCtrl.dismiss();
  }

  onAuth(data) {

    this.wallet.login({
      authData: data
    });

    this.viewCtrl.dismiss();

    this.router.navigate(['trips']);
  }
}
