import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { SafePipeModule } from 'safe-pipe';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SocialDeviceLoginPage } from "../pages/social-device-login/social-device-login";
import { LockscreenPage } from '../pages/lockscreen/lockscreen';
import { DeviceGroupSetupPage } from "../pages/device-group-setup/device-group-setup";
import { UserProfileSetupPage } from "../pages/user-profile-setup/user-profile-setup";
import { HomePage } from '../pages/home/home';

import { ClockComponent } from "../components/clock/clock";
import { SpeechComponent } from "../components/speech/speech";

import { ENV_PROVIDER_IT, environment} from '../environment/environment'

import { AUTH_PROVIDER_IT } from '../providers/auth/auth';
import { CognitoAuthProvider } from '../providers/cognito-auth/cognito-auth';
import { PROFILE_PROVIDER_IT } from '../providers/profile/profile';
import { CognitoProfileProvider } from '../providers/profile/cognito-profile';

import { DeviceAccountProvider } from '../providers/device-account/device-account';
import { InputProvider } from '../providers/input/input';

import { PollyProvider } from '../providers/polly/polly';
import { PollyPipe } from "../pipes/polly/polly";

import { GoogleDeviceAuthProvider, GOOGLE_AUTH_CONFIG_PROVIDER_IT } from '../providers/social-device-auth/google-device-auth';
import { FacebookDeviceAuthProvider, FACEBOOK_AUTH_CONFIG_PROVIDER_IT } from '../providers/social-device-auth/facebook-device-auth';

import { GoogleSession } from "../providers/federated-identity/google/google-session";
import { GoogleProfile } from "../providers/federated-identity/google/google-profile";
import { GoogleIdentityFactory } from "../providers/federated-identity/google/google-factory";

import { FacebookSession } from "../providers/federated-identity/facebook/facebook-session";
import { FacebookProfile } from "../providers/federated-identity/facebook/facebook-profile";
import { FacebookIdentityFactory } from "../providers/federated-identity/facebook/facebook-factory";

import { CognitoSession } from "../providers/federated-identity/cognito/cognito-session";
import { CognitoProfile } from "../providers/federated-identity/cognito/cognito-profile";
import { CognitoIdentityFactory } from "../providers/federated-identity/cognito/cognito-factory";

import { DeviceSession } from "../providers/federated-identity/device/device-session";
import { DeviceProfile } from '../providers/federated-identity/device/device-profile';
import { DeviceIdentityFactory } from '../providers/federated-identity/device/device-factory';

import { IFederatedIdentitySessionMapper } from "../providers/federated-identity/federated-identity-session-mapper";
import { FederatedIdentityProfileProvider } from '../providers/profile/federated-identity-profile';
import { FederatedIdentityProvider, IDENTITY_PROVIDER_IT } from '../providers/federated-identity/federated-identity';
import { IDENTITY_ON_UPDATE_PROVIDER_IT, FederatedIdentitySessionStorage } from '../providers/federated-identity/federated-identity-session-storage';
import { IAMAuthInterceptor } from '../providers/iam-auth-interceptor/iam-auth-interceptor';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SocialDeviceLoginPage,
    LockscreenPage,
    DeviceGroupSetupPage,
    UserProfileSetupPage,
    HomePage,
    ClockComponent,
    SpeechComponent,
    PollyPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    SafePipeModule,
    NgxQRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SocialDeviceLoginPage,
    LockscreenPage,
    DeviceGroupSetupPage,
    UserProfileSetupPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: ENV_PROVIDER_IT, useValue: environment},
    CognitoAuthProvider,
    {provide: AUTH_PROVIDER_IT, useExisting: CognitoAuthProvider},
    // {provide: PROFILE_PROVIDER_IT, useClass: CognitoProfileProvider},
    {provide: PROFILE_PROVIDER_IT, useClass: FederatedIdentityProfileProvider},
    InputProvider,
    DeviceAccountProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IAMAuthInterceptor,
      multi: true
    },
    PollyProvider,
    {provide: GOOGLE_AUTH_CONFIG_PROVIDER_IT, useValue: environment},
    GoogleDeviceAuthProvider,
    {provide: FACEBOOK_AUTH_CONFIG_PROVIDER_IT, useValue: environment},
    FacebookDeviceAuthProvider,
    GoogleSession,
    FacebookSession,
    CognitoSession,
    DeviceSession,
    GoogleProfile,
    FacebookProfile,
    CognitoProfile,
    DeviceProfile,
    GoogleIdentityFactory,
    FacebookIdentityFactory,
    CognitoIdentityFactory,
    DeviceIdentityFactory,
    IFederatedIdentitySessionMapper,
    FederatedIdentityProvider,
    {provide: IDENTITY_PROVIDER_IT, useExisting: FederatedIdentityProvider},
    {provide: IDENTITY_ON_UPDATE_PROVIDER_IT, useExisting: FederatedIdentityProvider},
    FederatedIdentitySessionStorage

  ]
})
export class AppModule {
  constructor(private test: FederatedIdentitySessionStorage) {

  }
}
