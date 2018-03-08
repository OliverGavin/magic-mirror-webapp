import { Component, Inject, OnInit } from '@angular/core';
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
import 'rxjs/add/operator/windowCount';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/operator/catch';
import { IDENTITY_PROVIDER_IT, IdentityProvider } from "../../providers/federated-identity/federated-identity";


@Component({
  selector: 'page-lockscreen',
  templateUrl: 'lockscreen.html'
})
export class LockscreenPage implements OnInit {
  private message: string
  private subscription: Subscription

  constructor(private navCtrl: NavController, private navParams: NavParams,
              // @Inject(AUTH_PROVIDER_IT) private auth: AuthProvider,
              @Inject(IDENTITY_PROVIDER_IT) private identity: IdentityProvider,
              private deviceAccount: DeviceAccountProvider,
              private input: InputProvider) {

  }

  ionViewDidEnter() {
    Promise.resolve()
      .then(() =>
        this.deviceAccount.loginDeviceAccount()
            .then(() => console.log('Logged in to device account'))
            .catch(() => console.log('Could not log in to device account'))
      )
      .then(() =>
        this.identity.isAuthenticated()
            .then(is => {
              if (!is) {
                this.navCtrl.push(LoginPage)
                throw 'Skip'
              }
            })
      )
      .then(() =>
        this.deviceAccount.isConfigured()
            .then(is => {
              if (!is) {
                this.navCtrl.push(DeviceGroupSetupPage)
                throw 'Skip'
              }
            })
      )
      .then(() =>
        this.deviceAccount.isUserConfigured()
            .then(is => {
              if (!is) {
                this.navCtrl.push(UserProfileSetupPage)
                throw 'Skip'
              }
            })
      )
      .then(() =>
        this.waitForFaceAuth(
          () => this.navCtrl.setRoot(HomePage),
          () => this.message = "Hello, I don't think we've met?"
        )
      )
      .catch(err => {if(err != 'Skip') console.log(err)})
  }

  waitForFaceAuth(onSuccess: () => void, onFailure?: () => void) {
    let subject = new Subject()
    let failureSubscription = subject
      .windowCount(3)
      .switchMap(window => window.takeLast(1))
      .subscribe(() => onFailure())

    let faceSubscription = this.input.getFaces()
      .throttleTime(1000)
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
      .switchMap(({ face }) => {
        return Observable.fromPromise(this.deviceAccount.authenticateUserFace(face))
          .catch(err => {
            subject.next()
            return Observable.empty()
          })
      })
      .subscribe((token) => {
        console.log(token)
        faceSubscription.unsubscribe()
        failureSubscription.unsubscribe()
        onSuccess()
      })
  }

  ngOnInit(): void {
    // this.auth.isAuthenticated().then(() => {
    //   console.log(AWS.config.credentials);
    //
    //   var id = (<AWS.CognitoIdentityCredentials>AWS.config.credentials).identityId;
    //   console.log('Cognito Identity ID '+ id);
    //
    //   // Instantiate aws sdk service objects now that the credentials have been updated
    //   var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
    //   var params = {
    //     TableName: 'MagicMirror-dev-users',
    //     Item:{userid:id, status:'b'}
    //   };
    //   docClient.put(params, function(err, data) {
    //     if (err)
    //        console.error(err);
    //     else
    //        console.log(data);
    //   });
    //
    // }).catch(() => {
    //   console.log('failed....')
    // })

  }

}
