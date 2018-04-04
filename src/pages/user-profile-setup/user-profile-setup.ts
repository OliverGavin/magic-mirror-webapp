import { Component, Inject, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';

import { DeviceAccountProvider } from "../../providers/device-account/device-account";
import { InputProvider } from "../../providers/input/input";


@Component({
  selector: 'page-user-profile-setup',
  templateUrl: 'user-profile-setup.html',
})
export class UserProfileSetupPage {
  private faces: Array<string> = []
  private messageAsync: Observable<string>

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private viewCtrl: ViewController,
              private zone: NgZone,
              private deviceAccount: DeviceAccountProvider,
              private input: InputProvider) {

  }

  ionViewDidEnter(): void {
    let attempts = 0
    this.messageAsync = Observable.from(["I just need to take your picture before we get started", "Please look into the camera"])
    Observable.of(null).delay(5000)
      .switchMap(() => this.input.getFaces())
      .throttleTime(500)
      .flatMap(face =>
          new Observable<HTMLImageElement>(observer => {
            console.log('xxx')
            let i = new Image()
            i.onload = () => observer.next(i)
            i.src = 'data:image/jpeg;charset=utf-8;base64,' + face
          })
          .filter(i => i.width >= 80 && i.height >= 80)
          .map(() => face)
      )
      .do(face => {
        this.zone.run(() => {
          this.faces.push(face)
        })
      })
      .take(6)
      .bufferCount(6)
      .concatMap(faces => Observable.fromPromise(this.deviceAccount.registerUserFace(faces)))
      .catch((err, caught) => {
        this.faces = []
        let message = ["Lets try that again?", "OK, once more...", ""][attempts++]
        this.messageAsync = Observable.from([message])
        return Observable.of(null)
          .delay(5000)
          .concatMap(() => {throw caught})
      })
      .retry(2)
      .subscribe(faces => {
          this.viewCtrl.dismiss()
        },
        err => {
          console.log(err)
          this.messageAsync = Observable.from(["Sorry, I cannot continue", "Please try again later"])
          Observable.of(null)
            .delay(5000)
            .subscribe(() => {this.viewCtrl.dismiss()})
        }
      )

  }

}
