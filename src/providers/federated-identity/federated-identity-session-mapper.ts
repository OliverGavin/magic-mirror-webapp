import { Injectable, Inject, InjectionToken } from '@angular/core';

import { IFederatedIdentityFactory, IFederatedIdentitySession, IFederatedIdentityProfile } from "./federated-identity";
import { CognitoIdentityFactory } from "./cognito/cognito-factory";
import { FacebookIdentityFactory } from "./facebook/facebook-factory";
import { GoogleIdentityFactory } from "./google/google-factory";
import { DeviceIdentityFactory } from './device/device-factory';


@Injectable()
export class IFederatedIdentitySessionMapper {

  private sessionProviders: { [provider: string]: IFederatedIdentityFactory<IFederatedIdentitySession, IFederatedIdentityProfile> }

  constructor(cognitoFactory: CognitoIdentityFactory,
              facebookFactory: FacebookIdentityFactory,
              googleFactory: GoogleIdentityFactory,
              deviceFactory: DeviceIdentityFactory) {
    this.sessionProviders = {
      // [cognitoFactory.getFederatedIdentitySession().getLoginProvider()]: cognitoFactory,
      [facebookFactory.getFederatedIdentitySession().getLoginProvider()]: facebookFactory,
      [googleFactory.getFederatedIdentitySession().getLoginProvider()]: googleFactory,
      [deviceFactory.getFederatedIdentitySession().getLoginProvider()]: deviceFactory
    }
  }

  get(provider: string): IFederatedIdentityFactory<IFederatedIdentitySession, IFederatedIdentityProfile> {
    return this.sessionProviders[provider]
  }

}
