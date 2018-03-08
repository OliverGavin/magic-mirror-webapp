import { Component, Injector } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { SocialDeviceAuthProvider } from "../../providers/social-device-auth/social-device-auth";
import { GoogleDeviceAuthProvider } from "../../providers/social-device-auth/google-device-auth";
import { FacebookDeviceAuthProvider } from "../../providers/social-device-auth/facebook-device-auth";
import { Subscription } from "rxjs/Subscription";


export enum SocialProviders {
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook'
}


let providerMap = {
  [SocialProviders.GOOGLE]: GoogleDeviceAuthProvider,
  [SocialProviders.FACEBOOK]: FacebookDeviceAuthProvider
}


@Component({
  selector: 'page-social-device-login',
  templateUrl: 'social-device-login.html',
})
export class SocialDeviceLoginPage {

  private socialAuth: SocialDeviceAuthProvider
  private socialAuthSubscription: Subscription
  private provider: SocialProviders
  private url: string
  private code: string
  private qr: string

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private viewCtrl: ViewController,
              private toastCtrl: ToastController,
              private injector: Injector) {
    this.provider = navParams.get('socialLoginProvider')
    this.socialAuth = injector.get(providerMap[this.provider])
  }

  ionViewDidLoad() {
    this.socialAuthSubscription = this.socialAuth.begin({
      onVerification: (url, code, qr?) => {
        this.url = url
        this.code = code
        this.qr = qr || url
      },
      onSuccess: (data) => {
        this.dismiss(data)
      },
      onTimeout: () => {
        this.toastCtrl.create({
          message: 'The verification code expired. Please try again.',
          duration: 5000,
          position: 'bottom'
        }).present()
        this.dismiss()
      },
      onError: (err) => {
        console.log(err)
        this.toastCtrl.create({
          message: 'An error occurred. Please try again.',
          duration: 5000,
          position: 'bottom'
        }).present()
        this.dismiss()
      }
    })
  }

  cancel() {
    this.socialAuthSubscription.unsubscribe()
    this.dismiss()
  }

  dismiss(data?) {
    this.viewCtrl.dismiss(data);
  }

}
