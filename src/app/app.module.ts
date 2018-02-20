import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { SafePipeModule } from 'safe-pipe';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
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
import { CognitoProfileProvider } from '../providers/cognito-profile/cognito-profile';
import { InputProvider } from '../providers/input/input';
import { DeviceAccountProvider } from '../providers/device-account/device-account';
import { CognitoAuthInterceptor } from '../providers/cognito-auth-interceptor/cognito-auth-interceptor';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    LockscreenPage,
    DeviceGroupSetupPage,
    UserProfileSetupPage,
    HomePage,
    ClockComponent,
    SpeechComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    SafePipeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
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
    {provide: PROFILE_PROVIDER_IT, useClass: CognitoProfileProvider},
    InputProvider,
    DeviceAccountProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CognitoAuthInterceptor,
      multi: true
    }

  ]
})
export class AppModule {}
