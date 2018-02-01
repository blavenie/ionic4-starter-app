import {Component, EventEmitter, Output} from '@angular/core';
import { MenuController} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";

/**
 * Generated class for the AuthPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

export interface AuthData {
  username: string;
  password: string;
  pubkey: string;
}

@Component({
  selector: 'form-auth',
  templateUrl: 'form-auth.html',
})
export class AuthForm {
  authForm: FormGroup;
  onCancel:EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onAuth: EventEmitter<any> = new EventEmitter<any>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              public formBuilder: FormBuilder) {
    this.authForm = formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z]*'), Validators.minLength(3), Validators.maxLength(30)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(3)])]
    });

  }

  cancel() {
    this.onCancel.emit();
  }

  onSubmit(event:any, data: any) {
    this.onAuth.emit({
      username: data.username,
      password: data.password
    });
  }
}
