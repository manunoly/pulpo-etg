import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {Storage} from "@ionic/storage";
import { TranslateService } from '@ngx-translate/core'
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-idioma',
  templateUrl: 'idioma.html',
})
export class IdiomaPage {
  

  constructor(public navCtrl: NavController, 
    private st : Storage,
    private translate: TranslateService
  ) {

    this.st.set('ls_idioma','es');

  }

  ionViewDidLoad(){

    this.st.get('ls_idioma').then(resultado => {
      if(resultado){
        this.translate.use(resultado);
        
      }else{
        this.translate.use('es');
      }
    });

  }

  choose(lang) {
    console.log(lang);
    
    this.st.set('ls_idioma',lang);
    this.translate.use(lang);
    
  }

  paginalogin(){
    this.navCtrl.push(LoginPage);
  }
}
