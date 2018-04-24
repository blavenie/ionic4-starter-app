import {Injectable} from "@angular/core";
import {ValidatorService} from "angular4-material-table";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Person} from "../../../services/model";

@Injectable()
export class PersonValidatorService implements ValidatorService {
  getRowValidator(): FormGroup {
    return this.getFormGroup();
  }

  getFormGroup(data?:Person): FormGroup {
    return new FormGroup({
      'id': new FormControl(),
      'lastName': new FormControl(data && data.lastName || null, Validators.required),
      'firstName': new FormControl(data && data.firstName || null, Validators.required),
      'email': new FormControl(data && data.email || null, Validators.compose([Validators.required, Validators.email]))
    });
  }
}
