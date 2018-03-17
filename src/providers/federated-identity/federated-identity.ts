import { Injectable, Inject, InjectionToken } from '@angular/core';

import * as AWS from "aws-sdk";

import { ENV_PROVIDER_IT } from "../../environment/environment";
import { AuthErrors } from "../auth/auth";  // TODO remove


export interface FederatedIdentitySession {
  getLoginProvider(): string
  getIdentityId(): string
  getLoginToken(): Promise<string>
  // expiry??
  getSession(): {}
  setSession(data: {})
}


export const IDENTITY_PROVIDER_IT = new InjectionToken<IdentityProvider>('identity')
export interface IdentityProvider {
  isAuthenticated(): Promise<boolean>
}


export class FederatedIdentityConfigProvider {
  IDENTITY_POOL_ID: string
  REGION: string
}


@Injectable()
export class FederatedIdentityProvider implements IdentityProvider {

  private session: FederatedIdentitySession

  constructor(@Inject(ENV_PROVIDER_IT) private config: FederatedIdentityConfigProvider) {

  }

  getFederatedIdentitySession(): FederatedIdentitySession {
    return this.session
  }

  setFederatedIdentitySession(session: FederatedIdentitySession): void {
    this.session = session
  }

  getIdentityId(): Promise<string> {
    return AWS.config.credentials.data.IdentityId
  }

  getSession(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.session) {
        reject(AuthErrors.NoSessionFound)
        return
      }

      this.session.getLoginToken().then((token: string) => {
        let logins = {}
        let identityId = this.session.getIdentityId()
        let endpoint = this.session.getLoginProvider()
        logins[endpoint] = token

        console.log(token)
        console.log(endpoint)
        console.log(logins)

        AWS.config.region = this.config.REGION

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : this.config.IDENTITY_POOL_ID,
            ...identityId && {IdentityId: identityId},
            Logins : logins,
            // LoginId: 'w@w.com'  // TODO investigate purpose? - possibly required for multiple sessions/users, not email?
        });

        (<AWS.CognitoIdentityCredentials>AWS.config.credentials).getPromise().then(() => {
          console.log('AWS Credentials:::')
          console.log(AWS.config.credentials)
          resolve()
        }).catch((err) => {
          console.log(err)
          reject('Failed to obtain AWS credentials')
        })
      })
      .catch(err => reject(err))
    })
  }

  public isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getSession()
        .then((_) => resolve(true))
        .catch(err => {
          // [AuthErrors.UserNotLoggedIn, AuthErrors.NoSessionFound, AuthErrors.SessionExpiredOrInvalid].includes(err) ?
            resolve(false) //: reject(err)
        })
    })
  }

}
