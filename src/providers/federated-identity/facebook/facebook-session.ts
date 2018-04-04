import { Injectable, Inject } from '@angular/core';

import { IFederatedIdentitySession } from "../federated-identity";
import { Subject } from 'rxjs';


export interface IFacebookSessionData {
  accessToken: string
  expires: number
}


@Injectable()
export class FacebookSession implements IFederatedIdentitySession {

  private session: IFacebookSessionData
  private changeSubject: Subject<IFacebookSessionData>

  constructor() {
    this.changeSubject = new Subject<IFacebookSessionData>()
  }

  public getSession(): IFacebookSessionData {
    return this.session
  }

  public setSession(data: IFacebookSessionData) {
    this.session = data
    this.changeSubject.next(this.session)
  }

	public getLoginProvider(): string {
		return 'graph.facebook.com'
	}

	getIdentityId(): string {
		return null
	}

	public getLoginToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.session.expires < new Date().getTime())
        reject(new Error('Session expired or is invalid'))

      resolve(this.session.accessToken)
    })
	}

  onUpdate(): Subject<{}> {
    return this.changeSubject
  }

}
