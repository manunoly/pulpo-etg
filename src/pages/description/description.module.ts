import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DescriptionPage } from './description';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    DescriptionPage,
  ],
  imports: [
    IonicPageModule.forChild(DescriptionPage),
    TranslateModule
  ],
})
export class DescriptionPageModule {}
