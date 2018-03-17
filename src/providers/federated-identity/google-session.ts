import { Injectable, Inject } from '@angular/core';

import { FederatedIdentitySession } from "./federated-identity";


export interface IGoogleSessionData {
  accessToken: string
  expiresIn: number
  refreshToken: string
  idToken: string
}


@Injectable()
export class GoogleSession implements FederatedIdentitySession {

  private session: IGoogleSessionData

  constructor() {
    // TODO expiry?
  }

  public getSession(): IGoogleSessionData {
    return this.session
  }

  public setSession(data: IGoogleSessionData) {
    this.session = data
  }

	public getLoginProvider(): string {
		return 'accounts.google.com'
	}

	getIdentityId(): string {
		return null
	}

	public getLoginToken(): Promise<string> {
    // TODO refresh, verify etc
    // AWS.config.credentials.params.Logins['graph.facebook.com'] = updatedToken;
    return new Promise<string>((resolve, reject) => {
      // resolve(this.session.accessToken)
      resolve(this.session.idToken)
    })
	}

}
