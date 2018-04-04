import { Injectable } from '@angular/core';

import { IFederatedIdentityFactory } from "../federated-identity";
import { DeviceSession } from "./device-session";
import { DeviceProfile } from "./device-profile";


@Injectable()
export class DeviceIdentityFactory implements IFederatedIdentityFactory<DeviceSession, DeviceProfile> {

  constructor(private session: DeviceSession,
              private profile: DeviceProfile) {

  }

	getFederatedIdentitySession(): DeviceSession {
		return this.session
	}

	getFederatedIdentityProfile(): DeviceProfile {
		return this.profile
	}

}
