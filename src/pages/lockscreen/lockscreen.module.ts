import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LockscreenPage } from './lockscreen';

@NgModule({
  declarations: [
    LockscreenPage,
  ],
  imports: [
    IonicPageModule.forChild(LockscreenPage),
  ],
})
export class LockscreenPageModule {}
