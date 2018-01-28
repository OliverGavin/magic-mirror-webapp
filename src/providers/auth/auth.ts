import { InjectionToken } from '@angular/core'


export const AUTH_PROVIDER_IT = new InjectionToken<AuthProvider>('auth')
export interface AuthProvider {
  login(IAuthLoginData): Promise<void>
  logout()
  register(IAuthRegistrationData): Promise<void>
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

// TODO enums rather than errors?
export class LoginError extends Error {
  constructor(message?: string) {
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
    else { this.__proto__ = new.target.prototype; }
  }
}

export class UserNotFoundError extends Error {
  constructor(message?: string) {
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
    else { this.__proto__ = new.target.prototype; }
  }
}

export class UserNotConfirmedError extends Error {
  constructor(message?: string) {
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
    else { this.__proto__ = new.target.prototype; }
  }
}

export class PasswordIncorrectError extends Error {
  constructor(message?: string) {
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
    else { this.__proto__ = new.target.prototype; }
  }
}

export class RegistrationError extends Error {
  constructor(message?: string) {
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
    else { this.__proto__ = new.target.prototype; }
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(message?: string) {
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) { Object.setPrototypeOf(this, actualProto); }
    else { this.__proto__ = new.target.prototype; }
  }
}
