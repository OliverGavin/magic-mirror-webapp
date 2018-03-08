import { Subscription } from "rxjs/Subscription";


export interface SocialDeviceAuthCallbacks {

  /**
   * Callback providing the necessary information allowing the user to continue the login sequence.
   * @param url  The URL where the verification code may be entered.
   * @param code The verification code.
   * @param qr   A URL with the verification code embedded for use in a QR code, for example.
   */
  onVerification (url: string, code: string, qr?: string): void

  /**
   * Callback to handle a successful login.
   * @param data The data returned such as access tokens and expirys.
   */
  onSuccess (data: {}): void

  /**
   * Callback to handle termination of the sequence due to the expiry of the verification code.
   */
  onTimeout (): void

  /**
   * Callback to handle errors.
   * @param err The reason for the error.
   */
  onError (err: any): void
}


export interface SocialDeviceAuthProvider {
  /**
   * Begin device login sequence.
   * @param  callbacks Callbacks to facilitate the login sequence.
   * @return           A Subscription which may be used to cancel the sequence.
   */
  begin(callbacks: SocialDeviceAuthCallbacks): Subscription
}
