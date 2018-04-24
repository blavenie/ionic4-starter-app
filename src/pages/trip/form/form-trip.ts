import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {TripValidatorService} from "../../trips/validator/validators";
import {FormGroup} from "@angular/forms";
import {Trip, Referential} from "../../../services/model";


@Component({
  selector: 'form-trip',
  templateUrl: './form-trip.html'
})
export class TripForm implements OnInit {

  form: FormGroup;
  onCancel:EventEmitter<any> = new EventEmitter<any>();
  locations: Referential[] = [
    new Referential({id: 1,label: 'XBR',name: 'Brest'}),
    new Referential({id: 2,label: 'XBL',name: 'Brest'})
  ];

  @Input()
  data: Trip;

  @Output()
  onSave: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private tripValidatorService: TripValidatorService) {
  }

  ngOnInit() {
    console.log("[trip-form] data:", this.data);
    this.form = this.tripValidatorService.getFormGroup(this.data);
    //this.form.setValue({
    //  departureDateTime: this.data.departureDateTime
    //});
  }

  cancel() {
    this.onCancel.emit();
  }

  onSubmit(event:any, data: any) {

    this.data.departureDateTime = data.departureDateTime;
    this.data.departureLocation.id = data.departureLocation.id;
    this.data.departureLocation.label = data.departureLocation.label;
    this.data.departureLocation.name = data.departureLocation.name;
    this.data.returnDateTime = data.returnDateTime;
    this.data.returnLocation.id = data.returnLocation && data.returnLocation.id;
    this.data.returnLocation.label = data.returnLocation && data.returnLocation.label;
    this.data.returnLocation.name = data.returnLocation && data.returnLocation.name;

    console.debug("[trip-form] saving data:", this.data);
    this.onSave.emit(data);
  }

  displayReferentialFn(ref?: Referential | any): string | undefined {
    return ref ? ref.name : undefined;
  }
}
