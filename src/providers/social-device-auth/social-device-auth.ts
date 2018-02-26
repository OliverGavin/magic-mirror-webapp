import { Subscription } from "rxjs/Subscription";

export interface SocialDeviceAuthProvider {
  begin(callbacks: {
          onVerification: (url: string, code: string, qr?: string) => void
          onSuccess: (token: string, expiresIn: number) => void
          onTimeout: () => void
          onError: (err) => void
        }): Subscription
}
