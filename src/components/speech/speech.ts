import { Component } from '@angular/core';


@Component({
  selector: 'speech',
  templateUrl: 'speech.html'
})
export class SpeechComponent {

  text: string;

  constructor() {
    this.text = "Hello, I don't think we've met?";
  }

}
