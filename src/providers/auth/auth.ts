import { InjectionToken } from '@angular/core'


export const AUTH_PROVIDER_IT = new InjectionToken<AuthProvider>('auth')
export interface AuthProvider {
  // isAuthenticated(): Promise<boolean>
  // // isAuthenticated(): Promise<void>
  // // isNotAuthenticated(): Promise<void>
  // getJwtIdToken(): Promise<string>
  register(IAuthRegistrationData): Promise<void>
  login(IAuthLoginData): Promise<void>
  logout()
}

export interface IAuthLoginData {
  email: string
  password: string
}

export interface IAuthRegistrationData {
  email: string
  password: string
  name: string
}

export enum AuthErrors {
  UserNotLoggedIn         = 'There is currently no user logged in',
  NoSessionFound          = 'There is currently no for the user',
  SessionExpiredOrInvalid = 'The user session has expired',

  LoginError              = 'An error occurred while trying to log in',
  UserNotFoundError       = 'The user does not exist',
  UserNotConfirmedError   = 'The user has not confirmed their account',
  PasswordIncorrectError  = 'The user has provided an incoreect password',

  RegistrationError       = 'An error occurred while trying to register',
  EmailAlreadyExistsError = 'The email address is already in use'
}
