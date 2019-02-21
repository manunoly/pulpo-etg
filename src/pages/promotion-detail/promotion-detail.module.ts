import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PromotionDetailPage } from './promotion-detail';
import { TranslateModule } from '@ngx-translate/core';  //En todas las paginas

@NgModule({
  declarations: [
    PromotionDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(PromotionDetailPage),
    TranslateModule
  ],
})
export class PromotionDetailPageModule {}
