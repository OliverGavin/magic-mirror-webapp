import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map"

import { AUTH_PROVIDER_IT, AuthProvider } from "../auth/auth";
import { PROFILE_PROVIDER_IT, ProfileProvider } from "../profile/profile";
import { ENV_PROVIDER_IT } from "../../environment/environment";
import { FederatedIdentityProvider } from "../federated-identity/federated-identity";
import { DeviceSession } from "../federated-identity/device-session";


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
              private deviceSession: DeviceSession,
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

  private getDeviceGroupOwnerToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.storage.get('DeviceAccount:DeviceGroupOwnerToken').then((v) => {
        if (v == null)
          reject()
        resolve(v)
      })
    })
  }

  private setDeviceGroupOwnerToken(value: string): Promise<void> {
    return this.storage.set('DeviceAccount:DeviceGroupOwnerToken', value)
  }

  private getDeviceGroupOwnerIdentityId(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.storage.get('DeviceAccount:DeviceGroupOwnerIdentityId').then((v) => {
        if (v == null)
          reject()
        resolve(v)
      })
    })
  }

  private setDeviceGroupOwnerIdentityId(value: string): Promise<void> {
    return this.storage.set('DeviceAccount:DeviceGroupOwnerIdentityId', value)
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
        .catch(err => err == null || (status in err && err.status == 404) ? resolve(false) : reject(err))
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
        .then(data => resolve(data['faceNum'] >= 6))
        .catch(err => reject(err))
    })
  }

  public loginDeviceAccount(): Promise<void> {
    // restore credentials
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDeviceGroupOwnerToken(), this.getDeviceGroupOwnerIdentityId()])
        .then(([token, identityId]) => {
          this.deviceSession.setSession({accessToken: token, expiresIn: 0})
          this.deviceSession.setIdentityId(identityId)
          this.federatedIdentity.setFederatedIdentitySession(this.deviceSession)
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
      Promise.all([this.federatedIdentity.getFederatedIdentitySession().getLoginProvider(),
                   this.federatedIdentity.getFederatedIdentitySession().getLoginToken()])
        .then(([provider, token]) =>
          this.http
            .post(this.apiConfig.API_ENDPOINT + `/api/openid/token`, {
              provider: provider,
              token: token
            })
            // .map(response => (<string> response['token']))
            .toPromise()
        )
        .then(({ token, identityId }) => {
          console.log(token, identityId)
          return Promise.all([
            this.setDeviceGroupOwnerToken(token),
            this.setDeviceGroupOwnerIdentityId(identityId)
          ])
        })
        .then(() => this.loginDeviceAccount())
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }

  public selectDeviceGroup(group: IDeviceGroupData): Promise<void> {
    return this.selectDeviceAccount()
      .then(() => this.setDeviceGroupId(group.id))
  }

  public joinDeviceGroup(): Promise<IDeviceGroupUserData> {
    // read current group from storage
    let group = {
      groupid: ''
    }
    return this.http
      .post(this.apiConfig.API_ENDPOINT + '/devicegroupusers', group)
      .map(response => (<IDeviceGroupUserData> response))
      .toPromise()
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
              token: token
            })
            .toPromise()
        )
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  }

  public authenticateUserFace(face: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.getDeviceGroupId()
        .then(groupId =>
          this.http
            .post(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/auth`, {
              face: face
            })
            .map(response => (<string> response['token']))
            .toPromise()
        )
        .then(token => resolve(token))
        .catch(err => reject(err))
    })
  }

}
