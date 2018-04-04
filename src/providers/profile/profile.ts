import { InjectionToken } from '@angular/core'


export const PROFILE_PROVIDER_IT = new InjectionToken<ProfileProvider>('profile')
export interface ProfileProvider {
  getFirstName(): Promise<string>
  getLastName(): Promise<string>
  getPicture(): Promise<string>
}
