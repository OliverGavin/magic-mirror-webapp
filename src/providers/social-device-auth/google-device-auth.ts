import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SocialDeviceAuthProvider } from "./social-device-auth";
import { Subscription } from "rxjs/Subscription";


@Injectable()
export class GoogleDeviceAuthProvider implements SocialDeviceAuthProvider {

  private static ENDPOINT = 'https://accounts.google.com/o/oauth2/device/code'
  private static CLIENT_ID = '887293527777-l9fkc42v06atg3jhcp9e6c0jceen43a1.apps.googleusercontent.com'
  private static CLIENT_SECRET = 'KteCzqxh4rE2pUNj0u4_UeXC'

  constructor(public http: HttpClient) {

  }

  begin(callbacks: {
          onVerification: (url: string, code: string, qr?: string) => void
          onSuccess: (token: string, expiresIn: number) => void
          onTimeout: () => void
          onError: (err) => void
        }): Subscription {
		return this.http
      .post(GoogleDeviceAuthProvider.ENDPOINT, {
        client_id: GoogleDeviceAuthProvider.CLIENT_ID,
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
