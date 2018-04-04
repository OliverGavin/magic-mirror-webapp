import { Injectable, Inject } from '@angular/core';

import { CognitoUser, CognitoUserPool, CognitoUserSession } from "amazon-cognito-identity-js";

import { IFederatedIdentitySession } from "../federated-identity";
import { ENV_PROVIDER_IT } from "../../../environment/environment";
import { AuthErrors } from "../../auth/auth";


export class CognitoSessionConfigProvider {
  USER_POOL_ID: string
  USER_POOL_CLIENT_ID: string
  REGION: string
}


export interface ICognitoSessionData {
  TODO: string
}


@Injectable()
export class CognitoSession implements IFederatedIdentitySession {

  private _user: CognitoUser

  constructor(@Inject(ENV_PROVIDER_IT) private config: CognitoSessionConfigProvider) {

  }

  public get user(): CognitoUser {
    return this._user
  }

  private get userPool(): CognitoUserPool {
    return new CognitoUserPool({
        UserPoolId: this.config.USER_POOL_ID,
        ClientId: this.config.USER_POOL_CLIENT_ID
    })
  }

	public getSession(): ICognitoSessionData {
		throw new Error("Method not implemented.");
	}

  public setSession(data: ICognitoSessionData) {
    throw new Error("Method not implemented.");
  }

	public getLoginProvider(): string {
		return `cognito-idp.${this.config.REGION}.amazonaws.com/${this.config.USER_POOL_ID}`
	}

	getIdentityId(): string {
		return null
	}

	public getLoginToken(): Promise<string> {
    // TODO refresh, verify etc
    this._user || (this._user = this.userPool.getCurrentUser())
    return new Promise<string>((resolve, reject) => {
      if (!this._user) {
        reject(AuthErrors.UserNotLoggedIn)
        return
      }

      this._user.getSession((err, session: CognitoUserSession) => {
        if(err) {
          reject(AuthErrors.NoSessionFound)
          return
        }
        if(!session.isValid()) {
          reject(AuthErrors.SessionExpiredOrInvalid)
          return
        }

        resolve(session.getIdToken().getJwtToken())

      })
    })
	}

}
