import { Component, Input } from '@angular/core';


@Component({
  selector: 'speech',
  templateUrl: 'speech.html'
})
export class SpeechComponent {

  @Input()
  text: string;

  constructor() {
    
  }

}
