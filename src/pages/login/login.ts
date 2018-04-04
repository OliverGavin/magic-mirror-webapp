import { Component, OnInit, Inject } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';

import { HomePage } from '../home/home'
import { AUTH_PROVIDER_IT, AuthProvider, AuthErrors } from '../../providers/auth/auth'
import { PasswordValidators } from '../../util/forms/validators'
import { SocialDeviceLoginPage } from "../social-device-login/social-device-login";
import { FederatedIdentityProvider } from "../../providers/federated-identity/federated-identity";

import * as AWS from "aws-sdk";
import { LockscreenPage } from "../lockscreen/lockscreen";
import { DeviceGroupSetupPage } from "../device-group-setup/device-group-setup";
import { UserProfileSetupPage } from "../user-profile-setup/user-profile-setup";
import { DeviceAccountProvider } from "../../providers/device-account/device-account";
import { GoogleIdentityFactory } from "../../providers/federated-identity/google/google-factory";
import { FacebookIdentityFactory } from "../../providers/federated-identity/facebook/facebook-factory";
import { CognitoIdentityFactory } from "../../providers/federated-identity/cognito/cognito-factory";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit {  // TODO: remove validation for log in

  private form: FormGroup
  private registering: boolean = true

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private modalCtrl : ModalController,
              private formBuilder: FormBuilder,
              @Inject(AUTH_PROVIDER_IT) private auth: AuthProvider,
              private deviceAccount: DeviceAccountProvider,
              private federatedIdentity: FederatedIdentityProvider,
              private googleFactory: GoogleIdentityFactory,
              private facebookFactory: FacebookIdentityFactory,
              private cognitoFactory: CognitoIdentityFactory) {
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
      this.federatedIdentity.setFederatedIdentityFactory(this.cognitoFactory)
      this.federatedIdentity.isAuthenticated()
        .then(() => {
          // this.navCtrl.setRoot(LockscreenPage)
          this.continue()
        })
      // let test = (<AWS.CognitoIdentityCredentials>AWS.config.credentials)
      // debugger
      // console.log(window.localStorage['CognitoIdentityServiceProvider.1ttl3ir4v456e9ari3eqgbjsge.t@t.com.accessToken'])
    })
    // .then(() => {
    //   this.navCtrl.setRoot(HomePage)
    // })
    .catch((err: AuthErrors) => {
      if (err == AuthErrors.UserNotFoundError)
        this.email.setErrors({
          usernotfound: true
        })
      else if (err == AuthErrors.UserNotConfirmedError)
        this.form.setErrors({
          usernotconfirmed: true
        })
      else if (err == AuthErrors.PasswordIncorrectError)
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
    .catch((err: AuthErrors) => {
      if (err == AuthErrors.EmailAlreadyExistsError)
        this.email.setErrors({
          emailtaken: true
        })
      else
        this.form.setErrors({
          ooops: true
        })
    })
  }

  private google() {
    let modal = this.modalCtrl.create(SocialDeviceLoginPage, {socialLoginProvider: 'Google'})
    modal.onDidDismiss(({ accessToken, expires, refreshToken, idToken } = {}) => {
      if (accessToken) {
        this.federatedIdentity.setFederatedIdentityFactory(this.googleFactory)
        this.googleFactory.getFederatedIdentitySession().setSession({accessToken, expires, refreshToken, idToken})
        this.federatedIdentity.isAuthenticated()
          .then(() => {
            // this.navCtrl.setRoot(LockscreenPage)
            this.continue()
          })
      }
    })
    modal.present()
  }

  private facebook() {
    let modal = this.modalCtrl.create(SocialDeviceLoginPage, {socialLoginProvider: 'Facebook'})
    modal.onDidDismiss(({ accessToken, expires } = {}) => {
      if (accessToken) {
        this.federatedIdentity.setFederatedIdentityFactory(this.facebookFactory)
        this.facebookFactory.getFederatedIdentitySession().setSession({accessToken, expires})
        this.federatedIdentity.isAuthenticated()
          .then(() => {
            // this.navCtrl.setRoot(LockscreenPage)
            this.continue()
          })
      }
    })
    modal.present()
  }

  private async continue() {
    await this.deviceAccount.joinDeviceGroup()
    if (!await this.deviceAccount.isConfigured()) {
      let modal = this.modalCtrl.create(DeviceGroupSetupPage)
      modal.onDidDismiss(async () => {
        if (await this.deviceAccount.isConfigured()) {
          if (!await this.deviceAccount.isUserConfigured()) {
            let modal = this.modalCtrl.create(UserProfileSetupPage)
            modal.onDidDismiss(async () => {
              if (await this.deviceAccount.isUserConfigured()) {
                this.navCtrl.pop()
              }
            })
            modal.present()
          } else {
            this.navCtrl.pop()
          }
        }
      })
      modal.present()
    } else {
      if (!await this.deviceAccount.isUserConfigured()) {
        let modal = this.modalCtrl.create(UserProfileSetupPage)
        modal.onDidDismiss(async () => {
          if (await this.deviceAccount.isUserConfigured()) {
            this.navCtrl.pop()
          }
        })
        modal.present()
      } else {
        this.navCtrl.pop()
      }
    }
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
