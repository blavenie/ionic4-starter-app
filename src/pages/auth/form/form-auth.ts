import {Component, EventEmitter, Output, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { ModalController } from "ionic-angular";
import { RegisterModal } from '../../register/modal/modal-register';
import { AuthData } from "../../../services/account-service";



@Component({
  selector: 'form-auth',
  templateUrl: 'form-auth.html'
})
export class AuthForm implements OnInit {

  private loading: boolean = false;
  public form: FormGroup;
  public error: string = null;

  public get value(): AuthData {
    return this.form.value;
  }

  public get valid(): boolean {
    return this.form.valid;
  }

  @Output()
  onCancel:EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onSubmit: EventEmitter<AuthData> = new EventEmitter<AuthData>();

  constructor(public formBuilder: FormBuilder,
              public modalCtrl: ModalController) {
    this.form = formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.required]
    });

  }


  ngOnInit() {
    // For DEV only
    /*this.form.setValue({
      username: 'benoit.lavenier@e-is.pro',
      password: 'priezPourMoi!'
    });*/
  }

  cancel() {
    this.onCancel.emit();
  }

  doSubmit(event:any, data: any) {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = null;
    this.onSubmit.take(1)
      .subscribe(res => {
        setTimeout(() => {
          this.loading = false;
        }, 500);
      });

      setTimeout(() => this.onSubmit.emit({
        username: data.username,
        password: data.password
      }));
  }

  register() {
    this.onCancel.emit();
    setTimeout(() => {
      let modal = this.modalCtrl.create(RegisterModal);
      modal.present();
    });
  }
}
