import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Storage } from '@ionic/storage';

import * as AWS from "aws-sdk";
import { Subject, Subscription } from 'rxjs';

import { FederatedIdentityProvider } from './federated-identity';
import { IFederatedIdentitySessionMapper } from './federated-identity-session-mapper';


export const IDENTITY_ON_UPDATE_PROVIDER_IT = new InjectionToken<IdentityOnUpdate>('identity-on-update')
export interface IdentityOnUpdate {
  onUpdate(): Subject<{identityId: string, sessionData: {}}>
}


@Injectable()
export class FederatedIdentitySessionStorage {  // TODO handle setting and updating device account here???

  constructor(private storage: Storage,
              private federatedIdentity: FederatedIdentityProvider,
              private identityFactories: IFederatedIdentitySessionMapper) {
    this.federatedIdentity.onUpdate().subscribe(({identityId, sessionLoginProvider, sessionData}) => {
      console.log('Notified about session update:')
      console.log(identityId)
      console.log(sessionLoginProvider)
      console.log(sessionData)
      let session = {sessionLoginProvider, sessionData}
      this.setAccountSession(identityId, session)
    })
  }

  private getAccountSession(identityId: string): Promise<{}> {
    return new Promise<{}>((resolve, reject) => {
      this.storage.get(`UserAccount:${identityId}:Session`).then((v) => {
        if (v == null)
          reject()
        resolve(v)
      })
    })
  }

  private setAccountSession(identityId: string, value: {sessionLoginProvider:string, sessionData: {}}): Promise<void> {
    return this.storage.set(`UserAccount:${identityId}:Session`, value)
  }

  public restore(): Promise<void> {
    let identityId = this.federatedIdentity.getIdentityId()
    return this.getAccountSession(identityId)
      .then(session => {
        const provider = session['sessionLoginProvider']
        const sessionData = session['sessionData']
        return {identityId, provider, sessionData}
      })
      .then(({identityId, provider, sessionData}) => {
        let identityFactory = this.identityFactories.get(provider)
        this.federatedIdentity.setFederatedIdentityFactory(identityFactory)
        identityFactory.getFederatedIdentitySession().setSession(sessionData)
        return this.federatedIdentity.getSession()
      })
  }

}
