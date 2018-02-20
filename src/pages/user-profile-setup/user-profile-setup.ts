import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';


import { PROFILE_PROVIDER_IT, ProfileProvider } from "../../providers/profile/profile";
import { DeviceAccountProvider } from "../../providers/device-account/device-account";
import { InputProvider } from "../../providers/input/input";


@Component({
  selector: 'page-user-profile-setup',
  templateUrl: 'user-profile-setup.html',
})
export class UserProfileSetupPage implements OnInit, OnDestroy {
  public faces: Array<string> = []
  private subscription: Subscription

  constructor(public navCtrl: NavController, public navParams: NavParams,
              @Inject(PROFILE_PROVIDER_IT) public profile: ProfileProvider,
              public deviceAccount: DeviceAccountProvider,
              public input: InputProvider) {

    this.profile.getName().then(value => {
      console.log(value)
    }).catch(reason => {
      console.log(reason)
    })

  }

  ngOnInit(): void {
    this.subscription = this.input.getFaces()
    .throttleTime(500)
    .switchMap(face =>

      new Observable<HTMLImageElement>(observer => {
        var i = new Image()
        i.onload = () => observer.next(i)
        i.src = 'data:image/jpeg;charset=utf-8;base64,' + face
      })
      .map(i => ({ face, i }))

    ).filter(({ i }) =>  {
      return i.width >= 80 && i.height >= 80
    })
    .take(10)
    .subscribe(({ face }) => {
      this.faces.push(face)
    })
    .add(() => {
      this.deviceAccount.registerUserFace(this.faces)
        .catch(err => {})
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

}
