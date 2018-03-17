import { Injectable } from '@angular/core';

import * as io from 'socket.io-client'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/share';


@Injectable()
export class InputProvider {
  private static URL = 'http://localhost:5000/camera'

  private facesObservable: Observable<string>

  constructor() {
    this.facesObservable = new Observable<string>(
      observer => {
        console.log('Connecting Socket...')
        let socket: SocketIOClient.Socket = io(InputProvider.URL)

        socket.on('subscribe', (data) => {
          let img = data['count']
          observer.next(img)
        })

        return () => {
          console.log('Disconnecting Socket...')
          socket.disconnect()
        }
      }
    )
    .share()
  }

  public getFaces(): Observable<string> {
    return this.facesObservable
  }

}
