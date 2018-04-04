import { Injectable } from '@angular/core';

import * as jwt_decode from "jwt-decode";

import { IFederatedIdentityProfile } from "../federated-identity";
import { CognitoSession } from "./cognito-session";


@Injectable()
export class CognitoProfile implements IFederatedIdentityProfile {

  private _attributes: {[key: string]: string}

  constructor(private session: CognitoSession) {

  }

  private getAttributes(): Promise<{[key: string]: string}> {
    return new Promise<{[key: string]: string}>((resolve, reject) => {

      // if(!this._attributes) {
      //
      //   const idToken = this.session.getSession().idToken
      //   let attributes
      //
      //   try {
      //     attributes = jwt_decode(idToken)
      //   } catch (Error) {
      //     reject(`CouldNotGetAttributes: Invalid IdToken`)  // TODO
      //     return
      //   }
      //
      //   this._attributes = attributes
      //
      //   console.log(attributes)
      //
      //   resolve(this._attributes)
      //
      //
      // } else {
      //   resolve(this._attributes)
      // }

      resolve(this._attributes)
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

  public getName(): Promise<string> {
    return this.getAttribute('name')
  }

}
