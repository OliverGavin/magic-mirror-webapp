import { Component } from '@angular/core';


@Component({
  selector: 'clock',
  templateUrl: 'clock.html'
})
export class ClockComponent {

  time: string;

  constructor() {
    let getTime = () => new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).toLowerCase()
    this.time = getTime()
    setInterval(() => {
      this.time = getTime()
    }, 60000);
  }

}
