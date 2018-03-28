import {Component, OnInit} from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import {Router, ActivatedRoute} from "@angular/router";

/**
 * Generated class for the TripPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-trip',
  templateUrl: './trip.html'
})
export class TripPage implements OnInit{

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe(res => console.log(res));

  }

  ngOnInit() {
    console.debug('[trip] init page');
  }

  ionViewDidLoad() {
    console.debug('[trip] page loaded');
  }

}
