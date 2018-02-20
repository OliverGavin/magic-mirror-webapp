import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import * as io from 'socket.io-client'


@Injectable()
export class InputProvider {
  private static URL = 'http://localhost:5000/camera'
  private socket: SocketIOClient.Socket

  constructor() {
    this.socket = io(InputProvider.URL)
  }

  public getFaces(): Observable<string> {
    let observable = new Observable<string>(observer => {
      this.socket.on('subscribe', (data) => {
        let img = data['count'];
        observer.next(img)
      })

      return () => {
        this.socket.disconnect()
      }
    })

    return observable
  }

}
