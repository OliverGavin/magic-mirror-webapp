import { Injectable, Inject, InjectionToken } from '@angular/core'

import AWS from 'aws-sdk'
import { CognitoUserPool, ICognitoUserPoolData, ISignUpResult, AuthenticationDetails,
         CognitoUser, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js'

import { AuthProvider, IAuthRegistrationData, IAuthLoginData, EmailAlreadyExistsError, RegistrationError, UserNotFoundError, UserNotConfirmedError, PasswordIncorrectError, LoginError } from "../auth/auth";
import { ENV_PROVIDER_IT } from '../../environment/environment'


export class ICognitoAuthData {
  USER_POOL_ID: string
  // USER_POOL_DOMAIN_NAME: string
  USER_POOL_CLIENT_ID: string
  IDENTITY_POOL_ID: string
  REGION: string
}

@Injectable()
export class CognitoAuthProvider implements AuthProvider {

  private _user: CognitoUser

  constructor(@Inject(ENV_PROVIDER_IT) private auth: ICognitoAuthData) {
    console.log('new CognitoAuthProvider')
  }

  private get userPool(): CognitoUserPool {
    return new CognitoUserPool({
        UserPoolId: this.auth.USER_POOL_ID,
        ClientId: this.auth.USER_POOL_CLIENT_ID
    })
  }

  private get identityPoolId(): string {
    return this.auth.IDENTITY_POOL_ID
  }

  public get user(): CognitoUser {
    return this._user
  }

  public getSession(): Promise<CognitoUserSession> {
    return new Promise<CognitoUserSession>((resolve, reject) => {
      if (!this._user) {
        reject(`UserNotLoggedIn`)  // TODO
        return
      }

      this._user.getSession((err, session: CognitoUserSession) => {
        if(err) {
          reject(`NoSession: ${err}`)  // TODO
          return
        }
        if(!session.isValid()) {
          reject(`SessionExpiredOrInvalid`)  // TODO
          return
        }
        resolve(session)
      })

    })
  }

	public register(registrationData: IAuthRegistrationData): Promise<void> {
    let attributes = [
      new CognitoUserAttribute({
        Name: 'name',
        Value: registrationData.name
      })
    ]

    return new Promise<void>((resolve, reject) => {
      this.userPool.signUp(registrationData.email, registrationData.password, attributes, null, (err: Error, result: ISignUpResult) => {
        if (err) {
          if (err.name === 'UsernameExistsException') {
            reject(new EmailAlreadyExistsError())
            return
          }
          reject(new RegistrationError())
          console.log(err)
          return
        }
        this._user = result.user
        resolve()
      })
    })

	}

  public login(loginData: IAuthLoginData): Promise<void> {
    let authenticationDetails = new AuthenticationDetails({
      Username: loginData.email,
      Password: loginData.password
    })

    this._user = new CognitoUser({
      Username: loginData.email,
      Pool: this.userPool
    })

    return new Promise<void>((resolve, reject) => {
      this._user.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession, userTrackingConfirmationNecessary: boolean) => {
          console.log('access token + ' + session.getAccessToken().getJwtToken());

          AWS.config.region = this.auth.REGION

          let logins = {}
          let endpoint = `cognito-idp.${this.auth.REGION}.amazonaws.com/${this.auth.USER_POOL_ID}`
          logins[endpoint] = session.getIdToken().getJwtToken()

          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId : this.auth.IDENTITY_POOL_ID,
              Logins : logins,
              LoginId: loginData.email
          });
          (<AWS.CognitoIdentityCredentials>AWS.config.credentials).getPromise().then(() => {
            console.log(AWS.config.credentials);
            resolve()
          })

        },
        onFailure: (err) => {
          switch (err.code) {
            case 'UserNotFoundException': {
              reject(new UserNotFoundError())
              break
            }
            case 'UserNotConfirmedException': {
              reject(new UserNotConfirmedError())
              break
            }
            case 'NotAuthorizedException': {
              reject(new PasswordIncorrectError())
              break
            }
            default: {
              reject(new LoginError())
              console.log(err)
              break
            }
          }
        }
      })
    })
  }

  public logout() {
    this._user.signOut();
    (<AWS.CognitoIdentityCredentials>AWS.config.credentials).clearCachedId()
  }

}
