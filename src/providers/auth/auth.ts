import { InjectionToken } from '@angular/core'


export const AUTH_PROVIDER_IT = new InjectionToken<AuthProvider>('auth')
export interface AuthProvider {
  isAuthenticated(): Promise<void>
  isNotAuthenticated(): Promise<void>
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

export const enum AuthErrors {
  LoginError,
  UserNotFoundError,
  UserNotConfirmedError,
  PasswordIncorrectError,
  RegistrationError,
  EmailAlreadyExistsError
}
