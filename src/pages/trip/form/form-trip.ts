import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject, OnInit} from '@angular/core';
import {TripValidatorService} from "../trips/validator/validators";
import {TripService} from "../../services/trip-service";
import {FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";
import {Trip} from "../../services/model";


@Component({
  selector: 'modal-trip',
  templateUrl: './modal-dialog.html'
})
export class TripDialog implements OnInit {

  form: FormGroup;
  data: Trip;

  constructor(
    private tripValidatorService: TripValidatorService,
    //private tripService: TripService,
    private dialogRef: MatDialogRef<TripDialog>,
    @Inject(MAT_DIALOG_DATA) data: Trip) {
    this.data = data;
  }

  ngOnInit() {
    this.form = this.tripValidatorService.getFormGroup(this.data);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
