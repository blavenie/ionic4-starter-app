import {Injectable} from "@angular/core";
import {ValidatorService} from "angular4-material-table";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable()
export class UserValidatorService implements ValidatorService {
  getRowValidator(): FormGroup {
    return new FormGroup({
      'name': new FormControl(null, Validators.required),
      'id': new FormControl(),
    });
  }
}
