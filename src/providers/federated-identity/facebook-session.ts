import { Injectable, Inject } from '@angular/core';

import { FederatedIdentitySession } from "./federated-identity";


export interface IFacebookSessionData {
  accessToken: string
  expiresIn: number
}


@Injectable()
export class FacebookSession implements FederatedIdentitySession {

  private session: IFacebookSessionData

  constructor() {
    // TODO expiry?
  }

  public getSession(): IFacebookSessionData {
    return this.session
  }

  public setSession(data: IFacebookSessionData) {
    this.session = data
  }

	public getLoginProvider(): string {
		return 'graph.facebook.com'
	}

	getIdentityId(): string {
		return null
	}

	public getLoginToken(): Promise<string> {
    // TODO refresh, verify etc
    // AWS.config.credentials.params.Logins['graph.facebook.com'] = updatedToken;
    return new Promise<string>((resolve, reject) => {
      resolve(this.session.accessToken)
    })
	}

}
