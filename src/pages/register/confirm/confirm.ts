import {Component, OnInit, OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { HomePage } from '../../home/home';


@Component({
  selector: 'page-registrer-confirm',
  templateUrl: 'confirm.html'
})
export class RegisterConfirmPage extends HomePage implements OnInit, OnDestroy {

  loading: boolean = true;
  subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(this.activatedRoute.paramMap.subscribe(params => {
      let email = params.get("email");
      console.log("Cheking account", email);
      if (this.accountService.isLogin()) {
        let emailAccount = this.accountService.account && this.accountService.account.email
        if (email != emailAccount) {      

          // Not same email : force logout
          return this.accountService.logout()
            .then(() => {
              this.loading = false;
            });
        }
      }
      this.loading = false;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }
}
