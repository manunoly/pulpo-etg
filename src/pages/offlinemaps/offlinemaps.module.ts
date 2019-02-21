import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OfflinemapsPage } from './offlinemaps';
import { TranslateModule } from '@ngx-translate/core';  //En todas las paginas

@NgModule({
  declarations: [
    OfflinemapsPage,
  ],
  imports: [
    IonicPageModule.forChild(OfflinemapsPage),
    TranslateModule
  ],
})
export class OfflinemapsPageModule {}
