// Auth
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {ModalController} from "ionic-angular";
import {AuthModal} from "../pages/auth/modal/modal-auth";
import {AccountService} from "./account-service";

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor(private accountService: AccountService,
              private modalCtrl: ModalController) {}

  canActivate(  next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
  {
    if (!this.accountService.isLogin()) {
      console.debug("[auth-gard] Need authentication for page /"+next.url.join('/'));
      return new Promise<boolean>((resolve) => {
        let modal = this.modalCtrl.create(AuthModal, {next: next});
        modal.onDidDismiss(() => {
          let res = this.accountService.isLogin();
          if (!res) {
           console.debug("[auth-gard] Authentication cancelled. Could not access to /" + next.url.join('/'));
          }
          resolve(res);
        });
        return modal.present(); 
      });
    } else {
      console.debug("[auth-gard] Authorized access to /"+next.url.join('/'));
      return true;
    }
  }
}
