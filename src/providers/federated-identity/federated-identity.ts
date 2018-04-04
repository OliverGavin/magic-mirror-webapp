import { Injectable, Inject, InjectionToken } from '@angular/core';

import * as AWS from "aws-sdk";
import { Subject, Subscription } from 'rxjs';

import { ENV_PROVIDER_IT } from "../../environment/environment";
import { AuthErrors } from "../auth/auth";  // TODO remove
import { IdentityOnUpdate } from './federated-identity-session-storage';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { GetIdInput, GetOpenIdTokenInput } from 'aws-sdk/clients/cognitoidentity';


export interface IFederatedIdentitySession {
  getLoginProvider(): string
  getIdentityId(): string
  getLoginToken(): Promise<string>
  getSession(): {}
  setSession(data: {})
  onUpdate(): Subject<{}>
}


export interface IFederatedIdentityProfile {
  getFirstName(): Promise<string>
  getLastName(): Promise<string>
  getPicture(): Promise<string>
}


export interface IFederatedIdentityFactory<T extends IFederatedIdentitySession, U extends IFederatedIdentityProfile> {
  getFederatedIdentitySession(): T
  getFederatedIdentityProfile(): U
}


export const IDENTITY_PROVIDER_IT = new InjectionToken<IdentityProvider>('identity')
export interface IdentityProvider {
  isAuthenticated(): Promise<boolean>
}


export interface FederatedIdentityConfigProvider {
  IDENTITY_POOL_ID: string
  REGION: string
}


@Injectable()
export class FederatedIdentityProvider implements IdentityProvider, IdentityOnUpdate, IFederatedIdentityFactory<IFederatedIdentitySession, IFederatedIdentityProfile> {

  private factory: IFederatedIdentityFactory<IFederatedIdentitySession, IFederatedIdentityProfile>
  private sessionUpdatededSubscription: Subscription
  private identityRefreshedSubject: Subject<{identityId: string, sessionLoginProvider: string, sessionData: {}}>

  constructor(@Inject(ENV_PROVIDER_IT) private config: FederatedIdentityConfigProvider) {
    this.identityRefreshedSubject = new Subject()
  }

  public setFederatedIdentityFactory(factory: IFederatedIdentityFactory<IFederatedIdentitySession, IFederatedIdentityProfile>): void {
    AWS.config.credentials && (<CognitoIdentityCredentials>AWS.config.credentials).clearCachedId()
    if(this.sessionUpdatededSubscription) this.sessionUpdatededSubscription.unsubscribe()
    this.factory = factory
    this.sessionUpdatededSubscription = this.getFederatedIdentitySession().onUpdate().subscribe(() => {
      console.log('updating session...')
      this.getSession()
        .then(() => {
          // push the new credentials
          let identityId = this.getIdentityId()
          let sessionLoginProvider = this.getFederatedIdentitySession().getLoginProvider()
          let sessionData = this.getFederatedIdentitySession().getSession()
          this.identityRefreshedSubject.next({identityId, sessionLoginProvider, sessionData})
        })
        .catch()
    })
  }

  public onUpdate(): Subject<{identityId: string, sessionLoginProvider: string, sessionData: {}}> {
		return this.identityRefreshedSubject
	}

	public getFederatedIdentityProfile(): IFederatedIdentityProfile {
		return this.factory.getFederatedIdentityProfile()
	}

  public getFederatedIdentitySession(): IFederatedIdentitySession {
    return this.factory.getFederatedIdentitySession()
  }

  public getIdentityId(): string {
    return (<CognitoIdentityCredentials>AWS.config.credentials).identityId
  }

  private get session(): IFederatedIdentitySession {
    return this.getFederatedIdentitySession()
  }

  public getSession(): Promise<void> {
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

        AWS.config.region = this.config.REGION;

        if (!(
          AWS.config.credentials &&
          (<GetIdInput | GetOpenIdTokenInput>(<CognitoIdentityCredentials>AWS.config.credentials).params).Logins[endpoint] == token
        ))
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId : this.config.IDENTITY_POOL_ID,
              ...identityId && {IdentityId: identityId},
              Logins : logins
          });

        (<CognitoIdentityCredentials>AWS.config.credentials).getPromise().then(() => {
          console.log('AWS credentials:')
          console.log(AWS.config.credentials)
          resolve()
        }).catch((err) => {
          console.log('Failed to obtain AWS credentials:')
          console.log(err)
          reject(err)
        })
      })
      .catch(err => reject(err))
    })
  }

  public isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.getSession()
        .then((_) => resolve(true))
        .catch(err => {
          // [AuthErrors.UserNotLoggedIn, AuthErrors.NoSessionFound, AuthErrors.SessionExpiredOrInvalid].includes(err) ?
            resolve(false) //: reject(err)
        })
    })
  }

}
