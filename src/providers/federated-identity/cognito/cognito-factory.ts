import { Injectable } from '@angular/core';

import { IFederatedIdentityFactory } from "../federated-identity";
import { CognitoSession } from "./cognito-session";
import { CognitoProfile } from "./cognito-profile";


@Injectable()
export class CognitoIdentityFactory implements IFederatedIdentityFactory<CognitoSession, CognitoProfile> {

  constructor(private session: CognitoSession,
              private profile: CognitoProfile) {

  }

	getFederatedIdentitySession(): CognitoSession {
		return this.session
	}

	getFederatedIdentityProfile(): CognitoProfile {
		return this.profile
	}

}
