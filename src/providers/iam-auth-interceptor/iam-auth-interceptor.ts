import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import * as AWS from "aws-sdk";
import * as v4 from 'aws-sign-web';


/**
 * Intercept HTTP requests to AWS and sign them using IAM credentials.
 */
@Injectable()
export class IAMAuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Check if the request is being made to AWS
    let isAWS = request.url.split('/')[2].endsWith('amazonaws.com')
    if (!isAWS)
      return next.handle(request)

    // Configure the signer with IAM credentials
    let signer = new v4.AwsSigner({
        service: 'execute-api',
        region: AWS.config.region,
        accessKeyId: AWS.config.credentials.accessKeyId,
        secretAccessKey: AWS.config.credentials.data.Credentials.SecretKey,
        sessionToken: AWS.config.credentials.sessionToken
    })

    // Extract the query parameters from the request for signing
    let params = new Object()
    for (let k of request.params.keys())
      params[k] = request.params.get(k)

    // Sign the request
    let signed = signer.sign({
        method: request.method,
        url: request.url,
        headers: {'Content-Type': 'application/json'},
        params: params,
        data: request.body || null
    });

    // Clone the request, adding the signed header
    request = request.clone({
      setHeaders: signed
    })

    // Continue with the intercepted request
    return next.handle(request)

  }

}
