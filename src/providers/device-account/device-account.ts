import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map"

import { AUTH_PROVIDER_IT, AuthProvider } from "../auth/auth";
import { PROFILE_PROVIDER_IT, ProfileProvider } from "../profile/profile";
import { ENV_PROVIDER_IT } from "../../environment/environment";
import { FederatedIdentityProvider, IFederatedIdentitySession } from "../federated-identity/federated-identity";
import { IFederatedIdentitySessionMapper } from "../federated-identity/federated-identity-session-mapper";
import { FederatedIdentitySessionStorage } from '../federated-identity/federated-identity-session-storage';
import { DeviceIdentityFactory } from '../federated-identity/device/device-factory';


export class IApiConfigData {
  API_ENDPOINT: string
}


export interface IDeviceGroupData {
  name: string
  id?: string
}


export interface IDeviceGroupUserData {
  groupid: string
  userid: string
  owner: boolean
}


@Injectable()
export class DeviceAccountProvider {

  constructor(public http: HttpClient, private storage: Storage,
              @Inject(AUTH_PROVIDER_IT) public auth: AuthProvider,
              // @Inject(PROFILE_PROVIDER_IT) public profile: ProfileProvider,
              private federatedIdentity: FederatedIdentityProvider,
              private identityFactories: IFederatedIdentitySessionMapper,
              private deviceFactory: DeviceIdentityFactory,
              private federatedIdentityStorage: FederatedIdentitySessionStorage,
              @Inject(ENV_PROVIDER_IT) private apiConfig: IApiConfigData) {

  }

  private getDeviceGroupId(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.storage.get('DeviceAccount:DeviceGroupId').then((v) => {
        if (v == null)
          reject()
        resolve(v)
      })
    })
  }

  private setDeviceGroupId(value: string): Promise<void> {
    return this.storage.set('DeviceAccount:DeviceGroupId', value)
  }

  private getDeviceAccountLoginProvider(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.storage.get('DeviceAccount:LoginProvider').then((v) => {
        if (v == null)
          reject()
        resolve(v)
      })
    })
  }

  private setDeviceAccountLoginProvider(value: string): Promise<void> {
    return this.storage.set('DeviceAccount:LoginProvider', value)
  }

  private getDeviceAccountSessionData(): Promise<{}> {
    return new Promise<{}>((resolve, reject) => {
      this.storage.get('DeviceAccount:SessionData').then((v) => {
        if (v == null)
          reject()
        resolve(v)
      })
    })
  }

  private setDeviceAccountSessionData(value: {}): Promise<void> {
    return this.storage.set('DeviceAccount:SessionData', value)
  }

  public isConfigured(): Promise<boolean> {
    // check local storage for device groupid and main user
    return new Promise<boolean>((resolve, reject) => {
      this.getDeviceGroupId()
        .then(groupId => {
          console.log(groupId)
          return this.http
            .get(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}`)
            .toPromise()
        })
        .then(() => resolve(true))
        .catch(err => err == null || (err.status == 404 || err.status == 403) ? resolve(false) : reject(err))
    })
  }

  public isUserConfigured(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      Promise.all([this.federatedIdentity.getIdentityId(), this.getDeviceGroupId()])
        .then(([userId, groupId]) => {
          return this.http
            .get(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/users/${userId}`)
            .toPromise()
        })
        .then(data => resolve(data['faceNum'] >= 3))
        .catch(err => reject(err))
    })
  }

  public loginDeviceAccount(): Promise<void> {
    // restore credentials
    return new Promise<void>((resolve, reject) => {
      // Promise.all([this.getDeviceGroupOwnerToken(), this.getDeviceGroupOwnerIdentityId()])
      //   .then(([token, identityId]) => {
      //     this.deviceSession.setSession({accessToken: token, expires: 0})
      //     this.deviceSession.setIdentityId(identityId)
      //     this.federatedIdentity.setIFederatedIdentitySession(this.deviceSession)
      //     return this.federatedIdentity.getSession()
      //   })
      Promise.all<string, {}>([this.getDeviceAccountLoginProvider(), this.getDeviceAccountSessionData()])
        .then(([provider, session]) => {
          let identityFactory = this.identityFactories.get(provider)
          identityFactory.getFederatedIdentitySession().setSession(session)
          this.federatedIdentity.setFederatedIdentityFactory(identityFactory)
          return this.federatedIdentity.getSession()
        })
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }

  public loginUserAccount(token: string): Promise<void> {
    // image auth
    // load credentials
    return new Promise<void>((resolve, reject) => {
      reject()
    })
  }

  public getDeviceGroups(): Promise<Array<IDeviceGroupData>> {
    return this.http
      .get(this.apiConfig.API_ENDPOINT + '/api/groups', {
        params: {
          'owner': 'true'
        }
      })
      .map(response => (<Array<IDeviceGroupData>> response))
      .toPromise()
  }

  public createDeviceGroup(group: IDeviceGroupData): Promise<IDeviceGroupData> {
    // then join it and select it..
    return this.http
      .post(this.apiConfig.API_ENDPOINT + '/api/groups', group)
      .map(response => (<IDeviceGroupData> response))
      .toPromise()
  }

  public selectDeviceAccount(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Promise.all([this.federatedIdentity.getFederatedIdentitySession().getLoginProvider(),
      //              this.federatedIdentity.getFederatedIdentitySession().getLoginToken()])
      //   .then(([provider, token]) =>
      //     this.http
      //       .post(this.apiConfig.API_ENDPOINT + `/api/openid/token`, {
      //         provider: provider,
      //         token: token
      //       })
      //       // .map(response => (<string> response['token']))
      //       .toPromise()
      //   )
      //   .then(({ token, identityId }) => {
      //     console.log(token, identityId)
      //     return Promise.all([
      //       this.setDeviceGroupOwnerToken(token),
      //       this.setDeviceGroupOwnerIdentityId(identityId)
      //     ])
      //   })
      //   .then(() => this.loginDeviceAccount())
      //   .then(() => resolve())
      //   .catch(err => reject(err))

      let session: IFederatedIdentitySession = this.federatedIdentity.getFederatedIdentitySession()
      let provider = session.getLoginProvider()
      let sessionData = session.getSession()

      Promise.all([
        this.setDeviceAccountLoginProvider(provider),
        this.setDeviceAccountSessionData(sessionData)
      ])
      .then(() => this.loginDeviceAccount())
      .then(() => resolve())
      .catch(err => reject(err))
    })
  }

  public selectDeviceGroup(group: IDeviceGroupData): Promise<void> {
    return this.selectDeviceAccount()
      .then(() => this.setDeviceGroupId(group.id))
  }

  public joinDeviceGroup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.federatedIdentity.getIdentityId(), this.getDeviceGroupId()])
        .then(([userId, groupId]) =>
          this.http
            .post(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/users`, {
              userId: userId
            })
            .toPromise()
        )
        .then(() => resolve())
        .catch(err => err == null || err.status == 409 || err.status == 404 ? resolve() : reject(err))
    })
  }

  public leaveDeviceGroup() {

  }

  public registerUserFace(faces: Array<string>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.federatedIdentity.getIdentityId(), this.getDeviceGroupId(),
                   this.federatedIdentity.getFederatedIdentitySession().getLoginProvider(),
                   this.federatedIdentity.getFederatedIdentitySession().getLoginToken()])
        .then(([userId, groupId, provider, token]) =>
          this.http
            .post(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/users/${userId}/faces`, {
              faces: faces,
              provider: provider,
              token: token  // TODO check if just identity token server side can be used??
            })
            .toPromise()
        )
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  }

  public authenticateUserFace(face: string): Promise<void> {
    // get stored tokens and load
    return this.getDeviceGroupId()
        .then(groupId => {
          console.log('### 1 Making face auth request')
          return this.http
            .post(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/auth`, {
              face: face
            })
            .do(() => {
              console.log('### 2 Completed face auth request')
            })
            .map(response => ({token: <string> response['token'], identityId: <string> response['identityId']}))
            .toPromise().catch(err => {console.log('### 2 err'); throw err})
        })
        // load the credentials
        .then(({token, identityId}) => {
          console.log('### 3 Loading cognito credentials')
          this.federatedIdentity.setFederatedIdentityFactory(this.deviceFactory)
          this.deviceFactory.getFederatedIdentitySession().setIdentityId(identityId)
          this.deviceFactory.getFederatedIdentitySession().setSession({
            accessToken: token,
            expires: new Date().getTime() + 15*60*1000  // TODO
          })
          return this.federatedIdentity.getSession().catch(err => {console.log('### 3.5 err'); throw err})
        })
        .then(() => {
          console.log('### 4 Restoring credentials')
          return this.federatedIdentityStorage.restore().catch(err => {console.log('### 4.5 err'); throw err})
        })
  }

}
