import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
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


export const GOOGLE_AUTH_CONFIG_PROVIDER_IT = new InjectionToken<GoogleAuthConfigProvider>('google-auth-config')
export interface GoogleAuthConfigProvider {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}


@Injectable()
export class GoogleDeviceAuthProvider implements SocialDeviceAuthProvider {

  private static INIT_ENDPOINT = 'https://obscure-dawn-41497.herokuapp.com/https://accounts.google.com/o/oauth2/device/code'
  // private static INIT_ENDPOINT = 'https://accounts.google.com/o/oauth2/device/code'
  private static STATUS_ENDPOINT = 'https://www.googleapis.com/oauth2/v4/token'

  constructor(public http: HttpClient,
              @Inject(GOOGLE_AUTH_CONFIG_PROVIDER_IT) private config: GoogleAuthConfigProvider) {

  }

  public begin(callbacks: SocialDeviceAuthCallbacks): Subscription {

    let now = new Date()

		return this.http
      .post(GoogleDeviceAuthProvider.INIT_ENDPOINT,
            `client_id=${this.config.GOOGLE_CLIENT_ID}&scope=profile`,
            {headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'})}
      )
      // Merge the inner Observable into the outer Observable
      .mergeMap(
        data => {
          let code = data['device_code']
          let userCode = data['user_code']
          let verificationUri = data['verification_url']
          let expiresIn = data['expires_in']
          let interval = data['interval']

          // Invoke the verification callback, allowing a URL and code or a direct URL/QR code to be shown
          callbacks.onVerification(verificationUri, userCode, `${verificationUri}?user_code=${userCode}`)

          // Begin polling at the specified interval
          return Observable.interval(interval * 1000)
            // Merge the inner Observable into the outer Observable
            .mergeMap(() =>
              this.http.post(GoogleDeviceAuthProvider.STATUS_ENDPOINT,
                             `client_id=${this.config.GOOGLE_CLIENT_ID}&client_secret=${this.config.GOOGLE_CLIENT_SECRET}`
                             + `&code=${code}&grant_type=http://oauth.net/grant_type/device/1.0`,
                             {headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'})}
              )
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
          expires: now.getTime() + data['expires_in'] * 1000,
          refreshToken: data['refresh_token'],
          idToken: data['id_token']
        }),
        err => (err instanceof TimeoutError) ? callbacks.onTimeout() : callbacks.onError(err)
      )

	}

}
