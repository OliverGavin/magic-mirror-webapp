import { Injectable, Inject, InjectionToken } from '@angular/core';

import { FederatedIdentitySession } from "./federated-identity";
import { CognitoSession } from "./cognito-session";
import { FacebookSession } from "./facebook-session";
import { GoogleSession } from "./google-session";


@Injectable()
export class FederatedIdentitySessionMapper {

  private sessionProviders: { [provider: string]: FederatedIdentitySession }

  constructor(cognitoSession: CognitoSession,
              facebookSession: FacebookSession,
              googleSession: GoogleSession) {
    this.sessionProviders = {
      [cognitoSession.getLoginProvider()]: cognitoSession,
      [facebookSession.getLoginProvider()]: facebookSession,
      [googleSession.getLoginProvider()]: googleSession
    }
  }

  get(provider: string): FederatedIdentitySession {
    return this.sessionProviders[provider]
  }

}
