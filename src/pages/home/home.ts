import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PROFILE_PROVIDER_IT, ProfileProvider } from "../../providers/profile/profile";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
              @Inject(PROFILE_PROVIDER_IT) public profile: ProfileProvider) {
    this.profile.getName().then(value => {
      console.log(value)
    }).catch(reason => {
      console.log(reason)
    })
  }

}
