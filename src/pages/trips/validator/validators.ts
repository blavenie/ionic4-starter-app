import {Injectable} from "@angular/core";
import {ValidatorService} from "angular4-material-table";
import {FormGroup, Validators, FormBuilder} from "@angular/forms";
import {Trip} from "../../../services/model";

@Injectable()
export class TripValidatorService implements ValidatorService {

  constructor(private formBuilder: FormBuilder)
  {
  }

  getRowValidator(): FormGroup {
    return this.getFormGroup();
  }

  getFormGroup(data?:Trip): FormGroup {
    return this.formBuilder.group({
      'id': [''],
      'vesselFeatures': ['', Validators.required],      
      'departureDateTime': ['', Validators.required],
      'departureLocation': ['', Validators.required],
      'returnDateTime': [''],
      'returnLocation': [''],
      'comments': ['', Validators.maxLength(2000)]
    });
  }
}
