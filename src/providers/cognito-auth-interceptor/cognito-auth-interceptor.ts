import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/switchMap';

import { CognitoAuthProvider } from "../cognito-auth/cognito-auth";


@Injectable()
export class CognitoAuthInterceptor implements HttpInterceptor {

  constructor(public auth: CognitoAuthProvider) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TODO if AWS
    let isAWS = request.url.split('/')[2].endsWith('amazonaws.com')
    if (!isAWS)
      return next.handle(request)

    return Observable.from(this.auth.getJwtIdToken()).switchMap(token => {
      console.log('IdToken: ' + token)
      request = request.clone({
        setHeaders: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      return next.handle(request)
    })
  }

}
