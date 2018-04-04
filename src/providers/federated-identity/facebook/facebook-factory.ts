import { Injectable } from '@angular/core';

import { IFederatedIdentityFactory } from "../federated-identity";
import { FacebookSession } from "./facebook-session";
import { FacebookProfile } from "./facebook-profile";


@Injectable()
export class FacebookIdentityFactory implements IFederatedIdentityFactory<FacebookSession, FacebookProfile> {

  constructor(private session: FacebookSession,
              private profile: FacebookProfile) {

  }

	getFederatedIdentitySession(): FacebookSession {
		return this.session
	}

	getFederatedIdentityProfile(): FacebookProfile {
		return this.profile
	}

}
