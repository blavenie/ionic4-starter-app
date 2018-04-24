import {Component, OnInit} from '@angular/core';
import {Trip} from "../../../services/model";
import { ViewController } from "ionic-angular";


@Component({
  selector: 'modal-trip',
  templateUrl: './modal-trip.html'
})
export class TripModal implements OnInit {

  data: Trip;

  constructor(
    public viewCtrl: ViewController) {
    this.data = new Trip();
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
