import { Component, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'speech',
  templateUrl: 'speech.html'
})
export class SpeechComponent {

  @Input()
  text: string | Observable<string>;

  constructor() {

  }

}
