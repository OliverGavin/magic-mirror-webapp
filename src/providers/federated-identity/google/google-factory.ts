import { Injectable } from '@angular/core';

import { IFederatedIdentityFactory } from "../federated-identity";
import { GoogleSession } from "./google-session";
import { GoogleProfile } from "./google-profile";


@Injectable()
export class GoogleIdentityFactory implements IFederatedIdentityFactory<GoogleSession, GoogleProfile> {

  constructor(private session: GoogleSession,
              private profile: GoogleProfile) {

  }

	getFederatedIdentitySession(): GoogleSession {
		return this.session
	}

	getFederatedIdentityProfile(): GoogleProfile {
		return this.profile
	}

}
