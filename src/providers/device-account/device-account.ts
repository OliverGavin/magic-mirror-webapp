import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map"

import { AUTH_PROVIDER_IT, AuthProvider } from "../auth/auth";
import { PROFILE_PROVIDER_IT, ProfileProvider } from "../profile/profile";
import { ENV_PROVIDER_IT } from "../../environment/environment";


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
              @Inject(PROFILE_PROVIDER_IT) public profile: ProfileProvider,
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
      Promise.all([this.profile.getId(), this.getDeviceGroupId()])
        .then(([userId, groupId]) => {
          return this.http
            .get(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/users/${userId}`)
            .toPromise()
        })
        .then(data => resolve(data['faceNum'] > 6))
        .catch(err => reject(err))
    })
  }

  public loginDeviceAccount() {
    // restore credentials
  }

  public loginUserAccount() {
    // image auth
    // load credentials
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

  public selectDeviceGroup(group: IDeviceGroupData): Promise<void> {
    return this.setDeviceGroupId(group.id)
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
      Promise.all([this.profile.getId(), this.getDeviceGroupId(), this.auth.getJwtIdToken()])
        .then(([userId, groupId, token]) =>
          this.http
            .post(this.apiConfig.API_ENDPOINT + `/api/groups/${groupId}/users/${userId}/faces`, {
              faces: faces,
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
