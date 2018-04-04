import { Injectable, Inject } from '@angular/core';

import { Subject } from 'rxjs';

import { IFederatedIdentitySession } from '../federated-identity';
import { ENV_PROVIDER_IT } from '../../../environment/environment';


export interface IDeviceSessionData {
  accessToken: string
  expires: number
}


export class DeviceSessionConfigProvider {
  DEVELOPER_PROVIDER_NAME: string
}


@Injectable()
export class DeviceSession implements IFederatedIdentitySession {

  private session: IDeviceSessionData
  private identityId: string

  constructor(@Inject(ENV_PROVIDER_IT) private config: DeviceSessionConfigProvider) {

  }

  public getSession(): IDeviceSessionData {
    return this.session
  }

  public setSession(data: IDeviceSessionData) {
    this.session = data
  }

	public getLoginProvider(): string {
		// return this.config.DEVELOPER_PROVIDER_NAME
		return 'cognito-identity.amazonaws.com'
	}

	setIdentityId(value: string) {
		this.identityId = value
	}

	getIdentityId(): string {
		return this.identityId
	}

	public getLoginToken(): Promise<string> {
    // TODO refresh, verify etc
    return new Promise<string>((resolve, reject) => {
      resolve(this.session.accessToken)
    })
	}

	onUpdate(): Subject<{}> {  // no-op since these are temporary credentials we don't want to write
		return new Subject()
	}

}
