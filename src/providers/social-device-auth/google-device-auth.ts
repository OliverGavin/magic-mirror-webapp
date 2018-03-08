import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, Inject } from '@angular/core';

import { Subscription } from "rxjs/Subscription";

import { SocialDeviceAuthProvider, SocialDeviceAuthCallbacks } from "./social-device-auth";


export const GOOGLE_AUTH_CONFIG_PROVIDER_IT = new InjectionToken<GoogleAuthConfigProvider>('google-auth-config')
export interface GoogleAuthConfigProvider {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}


@Injectable()
export class GoogleDeviceAuthProvider implements SocialDeviceAuthProvider {

  private static ENDPOINT = 'https://accounts.google.com/o/oauth2/device/code'

  constructor(public http: HttpClient,
              @Inject(GOOGLE_AUTH_CONFIG_PROVIDER_IT) private config: GoogleAuthConfigProvider) {

  }

  public begin(callbacks: SocialDeviceAuthCallbacks): Subscription {
		return this.http
      .post(GoogleDeviceAuthProvider.ENDPOINT, {
        client_id: this.config.GOOGLE_CLIENT_ID,
        scope: 'email%20profile'
      })
      .subscribe(
        data => {
          console.log(data)
        },
        err => {
          console.log(err)
        }
      )
	}

}
