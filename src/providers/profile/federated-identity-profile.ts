import { Injectable } from '@angular/core';

import { ProfileProvider } from "../profile/profile";
import { FederatedIdentityProvider } from '../federated-identity/federated-identity';


@Injectable()
export class FederatedIdentityProfileProvider implements ProfileProvider {

  constructor(private federatedIdentity: FederatedIdentityProvider) {

  }

  private get profile() {
    return this.federatedIdentity.getFederatedIdentityProfile()
  }

  public getFirstName(): Promise<string> {
    return this.profile.getFirstName()
  }

  public getLastName(): Promise<string> {
    return this.profile.getLastName()
  }

	public getPicture(): Promise<string> {
		return this.profile.getPicture()
	}

}
