import { Injectable, Inject, InjectionToken } from '@angular/core'

import AWS from 'aws-sdk'
import { CognitoUserPool, ICognitoUserPoolData, ISignUpResult, AuthenticationDetails,
         CognitoUser, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js'

import { AuthProvider, IAuthRegistrationData, IAuthLoginData, AuthErrors } from "../auth/auth";
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

  // TODO factor out user pool login from this so that an interface can be used with other login providers

  private _user: CognitoUser

  constructor(@Inject(ENV_PROVIDER_IT) private auth: ICognitoAuthData) {

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
    this._user || (this._user = this.userPool.getCurrentUser())
    return new Promise<CognitoUserSession>((resolve, reject) => {
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

        // TODO more efficient? not every time? swapping users, etc
        AWS.config.region = this.auth.REGION

        let logins = {}
        let endpoint = `cognito-idp.${this.auth.REGION}.amazonaws.com/${this.auth.USER_POOL_ID}`
        logins[endpoint] = session.getIdToken().getJwtToken()

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : this.auth.IDENTITY_POOL_ID,
            Logins : logins,
            // LoginId: 'w@w.com'  // TODO investigate purpose? - possibly required for multiple sessions/users, not email?
        });

        (<AWS.CognitoIdentityCredentials>AWS.config.credentials).getPromise().then(() => {
          resolve(session)
        }).catch((err) => {
          reject('Failed to obtain AWS credentials')
        })

      })

    })
  }

  public isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getSession()
        .then((_) => resolve(true))
        .catch(err => {
          [AuthErrors.UserNotLoggedIn, AuthErrors.NoSessionFound, AuthErrors.SessionExpiredOrInvalid].includes(err) ?
            resolve(false) : reject(err)
        })
    })
  }

  // public isAuthenticated(): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     this.getSession().then((_) => { resolve() }).catch((_) => { reject() })
  //   })
  // }
  //
  // public isNotAuthenticated(): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     this.getSession().then((_) => { reject() }).catch((_) => { resolve() })
  //   })
  // }

  public getJwtIdToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.getSession().then((session: CognitoUserSession) => {
        resolve(session.getIdToken().getJwtToken())
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
            reject(AuthErrors.EmailAlreadyExistsError)
            return
          }
          reject(AuthErrors.RegistrationError)
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

          return this.getSession()
                     .then(() => { resolve() })  // catch?

        },
        onFailure: (err) => {
          switch (err.code) {
            case 'UserNotFoundException': {
              reject(AuthErrors.UserNotFoundError)
              break
            }
            case 'UserNotConfirmedException': {
              reject(AuthErrors.UserNotConfirmedError)
              break
            }
            case 'NotAuthorizedException': {
              reject(AuthErrors.PasswordIncorrectError)
              break
            }
            default: {
              reject(AuthErrors.LoginError)
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
