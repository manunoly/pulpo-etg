import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdiomaPage } from './idioma';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    IdiomaPage,
  ],
  imports: [
    IonicPageModule.forChild(IdiomaPage),
    TranslateModule
  ], exports: [
   IdiomaPage
  ]
})
export class IdiomaPageModule {}
