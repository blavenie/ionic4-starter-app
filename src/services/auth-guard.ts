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
      console.log("[auth-gard] Access control {"+next.url+"}  login modal...");
      return new Promise<boolean>((resolve) => {
        let modal = this.modalCtrl.create(AuthModal, {next: next});
        modal.onDidDismiss(() => {
          let res = this.accountService.isLogin();
          if (!res) {
           console.log("[auth-gard] Unauthorized Access to {" + next.url + "}");
          }
          resolve(res);
        });
        return modal.present(); 
      });
    } else {
      console.log("[auth-gard] Authorized Access for user {" + this.accountService.account.email + "}");
      return true;
    }
  }
}
