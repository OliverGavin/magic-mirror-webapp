import { Component, Inject, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AUTH_PROVIDER_IT, AuthProvider } from "../../providers/auth/auth";
import { LoginPage } from '../login/login';

import { ClockComponent } from "../../components/clock/clock";
import { SpeechComponent } from "../../components/speech/speech";
import * as AWS from "aws-sdk";


@IonicPage()
@Component({
  selector: 'page-lockscreen',
  templateUrl: 'lockscreen.html',
})
export class LockscreenPage implements OnInit {

  constructor(public navCtrl: NavController, public navParams: NavParams,
              @Inject(AUTH_PROVIDER_IT) public auth: AuthProvider) {

    this.auth.isNotAuthenticated().then(() => {
      this.navCtrl.setRoot(LoginPage)
    })
    .catch(() => {})

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
