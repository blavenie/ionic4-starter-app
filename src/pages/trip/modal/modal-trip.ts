import {Component, OnInit, ViewChild} from '@angular/core';
import {Trip} from "../../../services/model";
import { ViewController } from "ionic-angular";
import { TripForm } from '../form/form-trip';


@Component({
  selector: 'modal-trip',
  templateUrl: './modal-trip.html'
})
export class TripModal implements OnInit {

  data: Trip;

  @ViewChild('form') private form: TripForm;

  constructor(
    public viewCtrl: ViewController) {
    //this.data = new Trip();
  }

  ngOnInit() {

  }

  onSave(data) {
    this.viewCtrl.dismiss();
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}
