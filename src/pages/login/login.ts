import { Component, OnInit, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';

import { HomePage } from '../home/home'
import { AUTH_PROVIDER_IT, AuthProvider, EmailAlreadyExistsError, UserNotFoundError, UserNotConfirmedError, PasswordIncorrectError } from '../../providers/auth/auth'
import { PasswordValidators } from '../../util/forms/validators'


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit {  // TODO: remove validation for log in

  private form: FormGroup
  private registering: boolean = true

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public formBuilder: FormBuilder,
              @Inject(AUTH_PROVIDER_IT) public auth: AuthProvider) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8),
        PasswordValidators.lower, PasswordValidators.upper, PasswordValidators.number, PasswordValidators.symbol
      ])]
    });
    let registrationForm = this.formBuilder.group({
      confirmPassword: ['', Validators.compose([Validators.required, PasswordValidators.match(this.password)])],
      name: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z -]+$/)])]
    });
    this.form.addControl('registrationForm', registrationForm);
    this.toggleRegistration();
  }

  private get email(): FormControl { return <FormControl>this.form.controls.email }

  private get password(): FormControl { return <FormControl>this.form.controls.password }

  private get confirmPassword(): FormControl { return <FormControl>this.registrationForm.controls.confirmPassword }

  private get name(): FormControl { return <FormControl>this.registrationForm.controls.name }

  private get registrationForm(): FormGroup { return <FormGroup>this.form.controls.registrationForm }

  private toggleRegistration() {
    this.registering = !this.registering;
    this.registering ? this.registrationForm.enable() : this.registrationForm.disable()
  }

  private login() {
    this.auth.login({
      email: this.email.value,
      password: this.password.value
    })
    .then(() => {
      this.navCtrl.setRoot(HomePage);
    })
    .catch((err: Error) => {
      if (err instanceof UserNotFoundError)
        this.email.setErrors({
          usernotfound: true
        })
      else if (err instanceof UserNotConfirmedError)
        this.form.setErrors({
          usernotconfirmed: true
        })
      else if (err instanceof PasswordIncorrectError)
        this.password.setErrors({
          passwordincorrect: true
        })
      else
        this.form.setErrors({
          ooops: true
        })
    })
  }

  private register() {
    this.auth.register({
      email: this.email.value,
      password: this.password.value,
      name: this.name.value
    })
    .then(() => {
      this.login()
    })
    .catch((err: Error) => {
      if (err instanceof EmailAlreadyExistsError)
        this.email.setErrors({
          emailtaken: true
        })
      else
        this.form.setErrors({
          ooops: true
        })
    })
  }

   private errors = {
     required: 'required',
     email: 'email must be valid',
     minlength: 'too short',
     match: 'must match',
     lower: 'lower-case letter required',
     upper: 'upper-case letter required',
     number: 'number required',
     symbol: 'symbol required',
     pattern: 'name must be valid',  // TODO: proper validator
     emailtaken: 'email already taken',
     ooops: 'something went wrong, try again',
     usernotfound: 'user does not exist',
     usernotconfirmed: 'a verification link has been sent to your email',
     passwordincorrect: 'incorrect'
   }

   getErrors(errs: ValidationErrors) {
    //  Object.keys(errs).forEach((value: string, index: number, array: string[]) => console.log(`>>> ${value} ${index} ${array}`))
     return [Object.keys(errs).map((k) => this.errors[k])[0]]
   }

}
