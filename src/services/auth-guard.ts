// Auth
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot,Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {ModalController} from "ionic-angular";
import {AuthModalPage} from "../pages/auth/modal/modal-auth";
import {WalletService} from "./wallet-service";

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor(private router:Router,
              private wallet: WalletService,
              public modalCtrl: ModalController) {}

  canActivate(  next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
  {
    if (!this.wallet.isLogin()) {
      console.log("Unauthorized Access,Redirecting to ", next);
      let modal = this.modalCtrl.create(AuthModalPage, {next: next});
      modal.present();
      return false;
    } else {
      return true;
    }
  }
}
