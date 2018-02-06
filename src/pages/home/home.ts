import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { NavController, NavParams } from 'ionic-angular';
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/take';

import { PROFILE_PROVIDER_IT, ProfileProvider } from "../../providers/profile/profile";
import { InputProvider } from "../../providers/input/input";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  public _face: string
  private subscription: Subscription

  constructor(public navCtrl: NavController, public navParams: NavParams,
              @Inject(PROFILE_PROVIDER_IT) public profile: ProfileProvider,
              public input: InputProvider, private sanitizer: DomSanitizer) {

    this.profile.getName().then(value => {
      console.log(value)
    }).catch(reason => {
      console.log(reason)
    })

  }

  get face() {
    return this.sanitizer.bypassSecurityTrustUrl(this._face)
  }

  ngOnInit(): void {
    this.subscription = this.input.getFaces()
    .throttleTime(500)
    .take(10)
    .subscribe(face => {
      this._face = face
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

}
