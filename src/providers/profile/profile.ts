import { InjectionToken } from '@angular/core'


export const PROFILE_PROVIDER_IT = new InjectionToken<ProfileProvider>('profile')
export interface ProfileProvider {
  getName(): Promise<string>
}
