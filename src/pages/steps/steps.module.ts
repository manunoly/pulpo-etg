import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StepsPage } from './steps';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    StepsPage,
  ],
  imports: [
    IonicPageModule.forChild(StepsPage),
    TranslateModule
  ],
  exports: [
    StepsPage
  ]
})
export class StepsPageModule {}
