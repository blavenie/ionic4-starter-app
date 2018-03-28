import {Injectable} from "@angular/core";
import {ValidatorService} from "angular4-material-table";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable()
export class TripValidatorService implements ValidatorService {
  getRowValidator(): FormGroup {
    return new FormGroup({
      'id': new FormControl(),
      'departureDateTime': new FormControl(null, Validators.required),
      'departureLocation': new FormControl(null, Validators.required),
      'returnDateTime': new FormControl(null),
      'returnLocation': new FormControl(null),
      'comments': new FormControl(null, Validators.maxLength(2000))
    });
  }
}
