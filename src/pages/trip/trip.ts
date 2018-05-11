import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { TripService } from '../../services/trip-service';
import { TripForm } from './form/form-trip';
import { Trip } from '../../services/model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'page-trip',
  templateUrl: './trip.html'
})
export class TripPage implements OnInit{

  loading: boolean = true;
  data: Trip;

  @ViewChild('form') private form: TripForm;

  constructor(
    private route: ActivatedRoute, 
    private tripService: TripService
    //private router: Router
  ) {
    console.log("Creating TripPage...");

    this.route.params.subscribe(res => {
        this.load(parseInt(res["id"]));
    });

  }

  ngOnInit() {
    console.debug('[trip] init page');
  }

  ionViewDidLoad() {
    console.debug('[trip] page loaded');
  }

  load(id: number) {
    this.tripService.load(id)
    .then(trip => {
      this.form.setValue(trip);
      this.data = trip;
      this.loading = false;
    });
  }

  save(event, data) {
    console.log("[trip] Saving...", data);
  }


}
