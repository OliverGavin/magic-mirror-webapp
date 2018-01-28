import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { FormsModule } from '@angular/forms';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { ENV_PROVIDER_IT, environment} from '../environment/environment'
import { AUTH_PROVIDER_IT } from '../providers/auth/auth';
import { CognitoAuthProvider } from '../providers/cognito-auth/cognito-auth';
import { PROFILE_PROVIDER_IT } from '../providers/profile/profile';
import { CognitoProfileProvider } from '../providers/cognito-profile/cognito-profile';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    {provide: ENV_PROVIDER_IT, useValue: environment},
    CognitoAuthProvider,
    {provide: AUTH_PROVIDER_IT, useExisting: CognitoAuthProvider},
    {provide: PROFILE_PROVIDER_IT, useClass: CognitoProfileProvider}

  ]
})
export class AppModule {}
