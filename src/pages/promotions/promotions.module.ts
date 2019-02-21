import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PromotionsPage } from './promotions';
import { TranslateModule } from '@ngx-translate/core';  //En todas las paginas

@NgModule({
  declarations: [
    PromotionsPage,
  ],
  imports: [
    IonicPageModule.forChild(PromotionsPage),
    TranslateModule
  ],
})
export class PromotionsPageModule {}
