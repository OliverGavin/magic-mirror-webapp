import { Injectable } from '@angular/core';

import { CognitoUserAttribute } from "amazon-cognito-identity-js";

import { ProfileProvider } from "../profile/profile";
import { CognitoAuthProvider } from "../cognito-auth/cognito-auth";


@Injectable()
export class CognitoProfileProvider implements ProfileProvider {

  private _attributes: {[key: string]: string}  // TODO: either clear and/or add multiple users

  constructor(private cognitoAuth: CognitoAuthProvider) {

  }

  private getAttributes(): Promise<{[key: string]: string}> {
    return this.cognitoAuth.getSession().then(() => {
      return new Promise<{[key: string]: string}>((resolve, reject) => {

        if(!this._attributes) {
          this.cognitoAuth.user.getUserAttributes((err: Error, attributes: Array<CognitoUserAttribute>) => {
            if (err) {
              reject(`CouldNotGetAttributes: ${err}`)  // TODO
              return
            }

            this._attributes = {}

            attributes.forEach(value => {
              this._attributes[value.getName()] = value.getValue()
            })

            resolve(this._attributes)

          })
        } else {
          resolve(this._attributes)
        }

      })
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

	public getId(): Promise<string> {
    return this.getAttribute('sub')
	}

}
