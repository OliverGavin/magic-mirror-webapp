import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';

import { IFederatedIdentitySession } from "../federated-identity";
import { GOOGLE_AUTH_CONFIG_PROVIDER_IT, GoogleAuthConfigProvider } from '../../social-device-auth/google-device-auth';


export interface IGoogleSessionData {
  accessToken: string
  expires: number
  refreshToken: string
  idToken: string
  loginIdToken?: string
}


@Injectable()
export class GoogleSession implements IFederatedIdentitySession {

  private static REFRESH_ENDPOINT = 'https://www.googleapis.com/oauth2/v4/token'

  private session: IGoogleSessionData
  private changeSubject: Subject<IGoogleSessionData>

  constructor(public http: HttpClient,
              @Inject(GOOGLE_AUTH_CONFIG_PROVIDER_IT) private config: GoogleAuthConfigProvider) {
    this.changeSubject = new Subject<IGoogleSessionData>()
  }

  public getSession(): IGoogleSessionData {
    return this.session
  }

  public setSession(data: IGoogleSessionData) {
    this.session = data
    this.changeSubject.next(this.session)
  }

	public getLoginProvider(): string {
		return 'accounts.google.com'
	}

	public getIdentityId(): string {
		return null
	}

	public async getLoginToken(): Promise<string> {
    let now = new Date()

    if (this.session.expires < now.getTime()) {
      console.log('Google session expired, refreshing')
      await this.http
        .post(GoogleSession.REFRESH_ENDPOINT,
              `client_id=${this.config.GOOGLE_CLIENT_ID}&client_secret=${this.config.GOOGLE_CLIENT_SECRET}`
              + `&refresh_token=${this.session.refreshToken}&grant_type=refresh_token&scope=profile`,
              {headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'})}
        )
        .toPromise()
        .then(data => {
          this.session.accessToken = data['access_token']
          this.session.loginIdToken = data['id_token']
          this.session.expires = now.getTime() + data['expires_in'] * 1000
          this.changeSubject.next(this.session)
        })
        .catch(err => {
          throw Error('Session expired or is invalid')
        })
    }

    return this.session.loginIdToken || this.session.idToken
	}

	public onUpdate(): Subject<{}> {
		return this.changeSubject
	}

}
