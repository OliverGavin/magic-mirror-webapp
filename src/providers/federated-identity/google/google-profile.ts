import { Injectable } from '@angular/core';

import * as jwt_decode from "jwt-decode";

import { IFederatedIdentityProfile } from "../federated-identity";
import { GoogleSession } from "./google-session";


@Injectable()
export class GoogleProfile implements IFederatedIdentityProfile {

  private _attributes: {[key: string]: string}  // TODO: either clear and/or add multiple users

  constructor(private session: GoogleSession) {

  }

  private getAttributes(): Promise<{[key: string]: string}> {
    return new Promise<{[key: string]: string}>((resolve, reject) => {

      if(!this._attributes) {

        const idToken = this.session.getSession().idToken
        const loginIdToken = this.session.getSession().loginIdToken
        let attributesIdToken
        let attributesLoginIdToken

        try {
          attributesIdToken = jwt_decode(idToken)
        } catch (Error) {
        }

        try {
          attributesLoginIdToken = jwt_decode(loginIdToken)
        } catch (Error) {
        }

        if (!(attributesIdToken || attributesLoginIdToken)) {
          reject(`CouldNotGetAttributes: Invalid IdToken`)  // TODO
          return
        }

        // chain map attributes from both tokens, keeping duplicates from the newer loginIdToken
        this._attributes = {...attributesIdToken, ...attributesLoginIdToken}

        console.log(this._attributes)

        resolve(this._attributes)


      } else {
        resolve(this._attributes)
      }

    })
  }

  private getAttribute(name: string): Promise<string> {
    return this.getAttributes().then((attributes: {[key: string]: string}) => {
      return new Promise<string>((resolve, reject) => {

        if(name in attributes)
          resolve(attributes[name])
        else
          reject(`AttributeNotFound: ${name}`)  // TODO

      })
    })
  }

  public getFirstName(): Promise<string> {
    return this.getAttribute('given_name')
  }

  public getLastName(): Promise<string> {
    return this.getAttribute('family_name')
  }

  public getPicture(): Promise<string> {
    return this.getAttribute('picture')
  }

}
