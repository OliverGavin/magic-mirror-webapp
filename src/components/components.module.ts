import { NgModule } from '@angular/core';
import { ClockComponent } from './clock/clock';
import { SpeechComponent } from './speech/speech';
@NgModule({
	declarations: [ClockComponent,
    SpeechComponent],
	imports: [],
	exports: [ClockComponent,
    SpeechComponent]
})
export class ComponentsModule {}
