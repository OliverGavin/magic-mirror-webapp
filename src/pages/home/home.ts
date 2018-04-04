import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ProfileProvider, PROFILE_PROVIDER_IT } from '../../providers/profile/profile';
import { LockscreenPage } from '../lockscreen/lockscreen';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  message: string

  constructor(private navCtrl: NavController, private navParams: NavParams,
              @Inject(PROFILE_PROVIDER_IT) private profile: ProfileProvider) {

  }

  ionViewDidLoad() {
    this.profile.getFirstName()
        .then(name => this.message = `Hello ${name}`)
  }

  lock() {
    this.navCtrl.setRoot(LockscreenPage)
  }

}
