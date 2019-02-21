import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfiguracionPage } from './configuracion';
import { TranslateModule } from '@ngx-translate/core';  //En todas las paginas
@NgModule({
  declarations: [
    ConfiguracionPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfiguracionPage),
    TranslateModule
  ],
})
export class ConfiguracionPageModule {}
