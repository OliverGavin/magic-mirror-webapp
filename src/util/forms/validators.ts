import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';


export class PasswordValidators {

  static match(matchWithControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      const valid = control.value === matchWithControl.value
      return valid ? null : {'match': {value: control.value}};
    };
  }

  static lower(control: AbstractControl): ValidationErrors {
    const valid = control.value.match(/[a-z]/)
    return valid ? null : {'lower': {value: control.value}};
  }

  static upper(control: AbstractControl): ValidationErrors {
    const valid = control.value.match(/[A-Z]/)
    return valid ? null : {'upper': {value: control.value}};
  }

  static number(control: AbstractControl): ValidationErrors {
    const valid = control.value.match(/[0-9]/)
    return valid ? null : {'number': {value: control.value}};
  }

  static symbol(control: AbstractControl): ValidationErrors {
    const valid = control.value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    return valid ? null : {'symbol': {value: control.value}};
  }

}
