import { Component, Inject } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AUTH_PROVIDER_IT, AuthProvider } from "../../providers/auth/auth";
import { LoginPage } from '../login/login';

import { ClockComponent } from "../../components/clock/clock";
import { SpeechComponent } from "../../components/speech/speech";


@IonicPage()
@Component({
  selector: 'page-lockscreen',
  templateUrl: 'lockscreen.html',
})
export class LockscreenPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
              @Inject(AUTH_PROVIDER_IT) public auth: AuthProvider) {

    this.auth.isNotAuthenticated().then(() => {
      this.navCtrl.setRoot(LoginPage)
    })

  }

}
