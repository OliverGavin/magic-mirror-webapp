import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IFederatedIdentityProfile } from "../federated-identity";
import { FacebookSession } from "./facebook-session";


@Injectable()
export class FacebookProfile implements IFederatedIdentityProfile {

  private static GRAPH_PROFILE_ENDPOINT = 'https://graph.facebook.com/v2.12/me'

  private _attributes: {[key: string]: string}  // TODO: either clear and/or add multiple users

  constructor(private http: HttpClient,
              private session: FacebookSession) {

  }

  private getAttributes(): Promise<{[key: string]: string}> {

    return new Promise<{[key: string]: string}>((resolve, reject) => {
      if(!this._attributes)
        this.http
          .get(FacebookProfile.GRAPH_PROFILE_ENDPOINT
               + `?access_token=${this.session.getSession().accessToken}`
               + `&fields=first_name,last_name,picture`)
          .toPromise()
          .then(data => {
            data.picture = data.picture.data.url
            this._attributes = data
            console.log(this._attributes)
            resolve(this._attributes)
          })
          .catch(reject)
      else
        resolve(this._attributes)
    })

  }

  private getAttribute(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.getAttributes().then((attributes: {[key: string]: string}) => {

        if(name in attributes)
          resolve(attributes[name])
        else
          reject(`AttributeNotFound: ${name}`)  // TODO

      })
    })
  }

  public getFirstName(): Promise<string> {
    return this.getAttribute('first_name')
  }

  public getLastName(): Promise<string> {
    return this.getAttribute('last_name')
  }

  public getPicture(): Promise<string> {
    return this.getAttribute('picture')
  }

}
