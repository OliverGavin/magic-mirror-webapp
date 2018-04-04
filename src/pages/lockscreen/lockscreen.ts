import { Component, Inject, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Subject } from "rxjs/Subject";

import { AUTH_PROVIDER_IT, AuthProvider } from "../../providers/auth/auth";
import { DeviceAccountProvider } from "../../providers/device-account/device-account";
import { InputProvider } from "../../providers/input/input";
import { PollyPipe } from "../../pipes/polly/polly";

import { LoginPage } from '../login/login';
import { DeviceGroupSetupPage } from "../device-group-setup/device-group-setup";
import { UserProfileSetupPage } from "../user-profile-setup/user-profile-setup";
import { HomePage } from "../home/home";

import { ClockComponent } from "../../components/clock/clock";
import { SpeechComponent } from "../../components/speech/speech";

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/windowCount';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/operator/catch';
import { IDENTITY_PROVIDER_IT, IdentityProvider } from "../../providers/federated-identity/federated-identity";


@Component({
  selector: 'page-lockscreen',
  templateUrl: 'lockscreen.html'
})
export class LockscreenPage {
  private subject: Subject<any> = new Subject()
  private faceSubscription: Subscription
  private i = 0
  private messageAsync: Observable<string>

  private signinDialog = false

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private zone: NgZone,
              @Inject(IDENTITY_PROVIDER_IT) private identity: IdentityProvider,
              private deviceAccount: DeviceAccountProvider,
              private input: InputProvider) {

  }

  ionViewDidEnter() {
    this.handle()
  }

  async handle() {
    try {

      await this.deviceAccount.loginDeviceAccount()
              .then(() =>
                console.log('Logged in to device account')
              )
              .catch(err =>
                console.log(err)
              )

      if (!await this.identity.isAuthenticated()) {
        this.navCtrl.push(LoginPage)
      }

      // else if (!await this.deviceAccount.isConfigured()) {
      //   this.navCtrl.push(DeviceGroupSetupPage)
      // }
      //
      // else if (!await this.deviceAccount.isUserConfigured()) {
      //   this.navCtrl.push(UserProfileSetupPage)
      // }

      else {
        this.waitForFaceAuth(
          () => this.navCtrl.setRoot(HomePage),
          () => {
            this.messageAsync = Observable.from(["Hello, I don't think we've met?", "Would you like to join?"])
            this.messageAsync
              .delay(5000)
              .finally(() => {
                this.signinDialog = true
                setTimeout(() => {
                  this.signinDialog = false
                  this.subject.next(null)
                }, 10000)
              })
              .subscribe()
          }
        )
      }

    } catch(err) {
      console.log(err)
    }
  }

  waitForFaceAuth(onSuccess: () => void, onFailure?: () => void) {

    this.faceSubscription = this.input.getFaces()
      .delay(1000)
      .throttleTime(1000)
      .concatMap(face => {

        console.log('### New face')

        return new Observable<HTMLImageElement>(observer => {
          console.log('### New face obs')
          var i = new Image()
          i.onload = () => observer.next(i)
          i.src = 'data:image/jpeg;charset=utf-8;base64,' + face
        })
        .filter(i => i.width >= 80 && i.height >= 80)
        .map(() => face)

      })
      .concatMap(face => {
        return Observable.fromPromise(this.deviceAccount.authenticateUserFace(face))
      })
      .retryWhen(errObs => {
        console.log('### Retrying face auth request')
        return errObs.concatMap(err => {
          console.log('### Retrying face auth request mergemap')
          console.log('@@@retrying...')
          this.i = this.i % 3; this.i++;
          console.log('@@@>>>>>>'+this.i)

          if (this.i < 3) return Observable.throw(err)

          return Observable.create(observer => {
            console.log('@@@prompting user...')
            this.zone.run(() => {
              onFailure()
            })
            this.subject.take(1).subscribe(() => {
              console.log('@@@continued after waiting...')
              // observer.next(Observable.empty())
              observer.next(Observable.throw(err))
            })
          })
        })

      })
      .retry()
      .take(1)
      .subscribe(() => {
        onSuccess()
      })
  }

  sure() {
    this.faceSubscription.unsubscribe()
    this.messageAsync = Observable.from(["Great!"])
    this.messageAsync
      .delay(1500)
      .finally(() => {
        this.signinDialog = false
        this.navCtrl.push(LoginPage)
      })
      .subscribe()
  }

  nah() {
    this.messageAsync = Observable.from(["Hmm... I don't like you very much"])
    this.messageAsync
      .delay(50)
      .finally(() => {
        this.signinDialog = false
        setTimeout(() => {this.subject.next(null)}, 5000)
      })
      .subscribe()
  }

  // ngOnInit(): void {
  //   this.auth.isAuthenticated().then(() => {
  //     console.log(AWS.config.credentials);
  //
  //     var id = (<AWS.CognitoIdentityCredentials>AWS.config.credentials).identityId;
  //     console.log('Cognito Identity ID '+ id);
  //
  //     // Instantiate aws sdk service objects now that the credentials have been updated
  //     var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
  //     var params = {
  //       TableName: 'MagicMirror-dev-users',
  //       Item:{userid:id, status:'b'}
  //     };
  //     docClient.put(params, function(err, data) {
  //       if (err)
  //          console.error(err);
  //       else
  //          console.log(data);
  //     });
  //
  //   }).catch(() => {
  //     console.log('failed....')
  //   })
  //
  // }

}
