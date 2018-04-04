import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, Inject } from '@angular/core';

import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/catch';
import { TimeoutError, Subscription } from 'rxjs'
import { Observable } from "rxjs/Observable";

import { SocialDeviceAuthProvider, SocialDeviceAuthCallbacks } from "./social-device-auth";


export const FACEBOOK_AUTH_CONFIG_PROVIDER_IT = new InjectionToken<FacebookAuthConfigProvider>('facebook-auth-config')
export interface FacebookAuthConfigProvider {
  FACEBOOK_APP_ID: string
  FACEBOOK_APP_SECRET: string
}


@Injectable()
export class FacebookDeviceAuthProvider implements SocialDeviceAuthProvider {

  private static INIT_ENDPOINT = 'https://graph.facebook.com/v2.12/device/login'
  private static STATUS_ENDPOINT = 'https://graph.facebook.com/v2.12/device/login_status'

  constructor(private http: HttpClient,
              @Inject(FACEBOOK_AUTH_CONFIG_PROVIDER_IT) private config: FacebookAuthConfigProvider) {

  }

	begin(callbacks: SocialDeviceAuthCallbacks): Subscription {

    let now = new Date()

		return this.http
      // Request a verification code
      .post(FacebookDeviceAuthProvider.INIT_ENDPOINT, {
        access_token: `${this.config.FACEBOOK_APP_ID}|${this.config.FACEBOOK_APP_SECRET}`,
        scope: 'public_profile'
      })
      // Merge the inner Observable into the outer Observable
      .mergeMap(
        data => {
          let code = data['code']
          let userCode = data['user_code']
          let verificationUri = data['verification_uri']
          let expiresIn = data['expires_in']
          let interval = data['interval']

          // Invoke the verification callback, allowing a URL and code or a direct URL/QR code to be shown
          callbacks.onVerification(verificationUri, userCode, `${verificationUri}?user_code=${userCode}`)

          // Begin polling at the specified interval
          return Observable.interval(interval * 1000)
            // Merge the inner Observable into the outer Observable
            .mergeMap(() =>
              this.http.post(FacebookDeviceAuthProvider.STATUS_ENDPOINT, {
                // Poll using the code provided from the initial request
                access_token: `${this.config.FACEBOOK_APP_ID}|${this.config.FACEBOOK_APP_SECRET}`,
                code: code
              })
              .catch(err => {
                if (err instanceof HttpErrorResponse && err.error && err.error.error)
                  // An error is returned until verification is successful, continue
                  return Observable.of(err.error)
                else
                  // Terminate on any other HTTP errors
                  return Observable.throw(err)
              })
            )
            // Take the first valid response containing an access token, filter out all others
            // This allows only one value to be sent to subscribers as the interval/polling wil stop.
            .first(data => data.access_token)
            // .filter(data => data.access_token)
            // .take(1)
            // Allow the Observable to wait a maximum amount of time set by the expiry before returning a TimeoutError
            .timeout(expiresIn * 1000)

        }
      )
      .subscribe(
        data => callbacks.onSuccess({
          accessToken: data['access_token'],
          expires: now.getTime() + data['expires_in'] * 1000
        }),
        err => (err instanceof TimeoutError) ? callbacks.onTimeout() : callbacks.onError(err)
      )

	}

}
