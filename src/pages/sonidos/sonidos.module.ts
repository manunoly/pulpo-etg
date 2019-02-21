import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SonidosPage } from './sonidos';

@NgModule({
  declarations: [
    SonidosPage,
  ],
  imports: [
    IonicPageModule.forChild(SonidosPage),
  ],
})
export class SonidosPageModule {}
