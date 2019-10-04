import { LoginPage } from './../login/login';
import { Proveedor1Provider } from './../../providers/proveedor1/proveedor1';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Storage } from "@ionic/storage";
import {NgModel} from "@angular/forms";


@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  usernameModel: NgModel;
  formDataPerfil;
  user;

  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public proveedor: Proveedor1Provider,
    public storage: Storage,
    public translate: TranslateService,
    public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    this.storage.get('data-user').then((user) => {
      console.log(user);
      this.user = user;
     }).catch(error=>console.log(error))
    
  }

  actualizarPerfil(data) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: '...'
    });

    loading.present();
    console.log(data);

    this.proveedor.actualizarPerfil(data).then((result) => {
      loading.dismiss();
      console.log(result);

    }, (err) => {
      loading.dismiss();
      console.log(err);
      let alert = this.alertCtrl.create({
        title: '<b>Error</br></b>',
        subTitle: err.error,
        buttons: ['OK']
      });
      alert.present();
    }).catch();
  }

  logOut(){
    this.proveedor.logout();
    this.navCtrl.setRoot(LoginPage);
  }
}
