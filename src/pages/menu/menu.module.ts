import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuPage } from './menu';
import { TranslateModule } from '@ngx-translate/core';  //En todas las paginas

@NgModule({
  declarations: [
    MenuPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuPage),
    TranslateModule
  ],
  exports: [
    MenuPage
  ]
})
export class MenuPageModule {}
