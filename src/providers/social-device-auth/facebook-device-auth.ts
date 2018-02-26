import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/catch';
import { TimeoutError, Subscription } from 'rxjs'
import { Observable } from "rxjs/Observable";

import { SocialDeviceAuthProvider } from "./social-device-auth";


@Injectable()
export class FacebookDeviceAuthProvider implements SocialDeviceAuthProvider {

  private static INIT_ENDPOINT = 'https://graph.facebook.com/v2.12/device/login'
  private static STATUS_ENDPOINT = 'https://graph.facebook.com/v2.6/device/login_status'
  private static APP_ID = '1634271429961880'
  private static APP_SECRET = 'ae32c38b578fe1f8cfe6715c5f4ca7e7'

  constructor(public http: HttpClient) {

  }

	begin(callbacks: {
          onVerification: (url: string, code: string, qr?: string) => void
          onSuccess: (token: string, expiresIn: number) => void
          onTimeout: () => void
          onError: (err) => void
        }): Subscription {
		return this.http
      .post(FacebookDeviceAuthProvider.INIT_ENDPOINT, {
        access_token: `${FacebookDeviceAuthProvider.APP_ID}|${FacebookDeviceAuthProvider.APP_SECRET}`,
        scope: 'public_profile'
      })
      .mergeMap(
        data => {
          console.log(data)
          let code = data['code']
          let userCode = data['user_code']
          let verificationUri = data['verification_uri']
          let expiresIn = data['expires_in']
          let interval = data['interval']

          callbacks.onVerification(verificationUri, userCode, `${verificationUri}?user_code=${userCode}`)

          return Observable.interval(interval * 1000)
            .mergeMap(() =>
              this.http.post(FacebookDeviceAuthProvider.STATUS_ENDPOINT, {
                access_token: `${FacebookDeviceAuthProvider.APP_ID}|${FacebookDeviceAuthProvider.APP_SECRET}`,
                code: code
              })
              .catch(err => {
                if (err instanceof HttpErrorResponse && err.error && err.error.error)
                  return Observable.of(err.error)
                else
                  return Observable.throw(err)
              })
            )
            .first(data => data.access_token)
            // .filter(data => data.access_token)
            // .take(1)
            .timeout(expiresIn * 1000)

        }
      )
      .subscribe(
        data => callbacks.onSuccess(data['access_token'], data['expires_in']),
        err => (err instanceof TimeoutError) ? callbacks.onTimeout() : callbacks.onError(err)
      )
	}

}
