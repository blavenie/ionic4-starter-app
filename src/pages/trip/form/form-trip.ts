import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {TripValidatorService} from "../../trips/validator/validators";
import {FormGroup} from "@angular/forms";
import {Trip, Referential, VesselFeatures} from "../../../services/model";


@Component({
  selector: 'form-trip',
  templateUrl: './form-trip.html'
})
export class TripForm implements OnInit {

  form: FormGroup;
  locations: Referential[] = [
    new Referential({id: 1,label: 'XBR',name: 'Brest'}),
    new Referential({id: 2,label: 'XBL',name: 'Boulogne'})
  ];
  vessels: VesselFeatures[] = [
    new VesselFeatures().fromObject({vesselId: 1, exteriorMarking: 'FRA000851751', name: 'Vessel1'}),
    new VesselFeatures().fromObject({vesselId: 2, exteriorMarking: 'BEL000152147', name: 'Belgium Oscar'})
  ];

  public get value(): any {
    return this.form.value;
  }
  
  @Output()
  onCancel:EventEmitter<any> = new EventEmitter<any>();
  
  @Output()
  onSubmit: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private tripValidatorService: TripValidatorService) {
  }

  ngOnInit() {
    this.form = this.tripValidatorService.getFormGroup();
  }

  cancel() {
    this.onCancel.emit();
  }

  doSubmit(event:any, data: any) {
    if (this.form.invalid) return;    
    this.onSubmit.emit(data);
  }

  displayReferentialFn(ref?: Referential | any): string | undefined {
    return ref ? (ref.label + " - " + ref.name) : undefined;
  }

  displayVesselFn(ref?: VesselFeatures | any): string | undefined {
    return ref ? (ref.exteriorMarking + " - " + ref.name) : undefined;
  }
  

  public setValue(data: any) {
    let value = this.getValue(this.form, data);
    this.form.setValue(value);
  }

  getValue(form: FormGroup, data: any) {
    let value = {};
    form = form || this.form;
    for (let key in form.controls) {
      if (form.controls[key] instanceof FormGroup) {
        value[key] = this.getValue(form.controls[key] as FormGroup, data[key]);
      }
      else {
        value[key] = data[key] || null;
      }
    }
    return value;
  }
}
