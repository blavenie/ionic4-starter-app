import {EventEmitter, Injectable, Output} from "@angular/core";
import {Http} from "@angular/http";
import {AlertController} from "ionic-angular";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";


@Injectable()
export class WalletService {

  public data:any = {};

  public onLogin: EventEmitter<any> = new EventEmitter<any>();
  public onLogout: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.resetData();
    this.data.pubkey = window.localStorage.getItem('pubkey');
  }

  private resetData() {
    this.data.loaded = false;
    this.data.pubkey = null;
  }

  public isLogin():boolean {
    return !!this.data.pubkey;
  }

  public login(options: any) {
      if (options && options.authData) {
        this.data.pubkey = options.authData.username;

        window.sessionStorage.setItem('salt', options.authData.username);
        window.sessionStorage.setItem('password', options.authData.password);
        window.localStorage.setItem('pubkey', options.authData.username/*TODO compute pubkey*/);

        this.onLogin.emit(this.data);
      }

    console.log("[wallet] login");
  }

  public logout() {
    this.resetData();

    window.sessionStorage.removeItem('salt');
    window.sessionStorage.removeItem('password');
    window.localStorage.removeItem('pubkey');

    this.onLogout.emit();
  }
}
