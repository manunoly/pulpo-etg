import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapaPage } from './mapa';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MapaPage,
  ],
  imports: [
    IonicPageModule.forChild(MapaPage),
    TranslateModule
  ],
})
export class MapaPageModule {}
