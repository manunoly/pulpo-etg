import { LoginPage } from './../login/login';
import { Proveedor1Provider } from './../../providers/proveedor1/proveedor1';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { TranslateService } from '@ngx-translate/core';
import { Storage } from "@ionic/storage";
import { NgModel } from "@angular/forms";


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
    }).catch(error => this.navCtrl.pop())

  }

  actualizarPerfil(data) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: '...'
    });
    data['user_id'] = this.user.id;
    loading.present();
    console.log(data);

    this.proveedor.actualizarPerfil(data).then(async (result) => {
      const msg = await this.translate.get('P2:PERFIL').toPromise();

      if (result['profile'] != undefined)
        this.storage.set('data-user', result['profile']);

      loading.dismiss();
      let alert = this.alertCtrl.create({
        title: '',
        subTitle: msg,
        buttons: ['OK']
      });
      alert.present();



    }, async (err) => {
      const msg = await this.translate.get('P2:PERFILERROR').toPromise();

      loading.dismiss();
      console.log(err);
      let alert = this.alertCtrl.create({
        title: '<b>Error</br></b>',
        subTitle: msg,
        buttons: ['OK']
      });
      alert.present();
    }).catch();
  }

  logOut() {
    this.proveedor.logout();
    this.navCtrl.setRoot(LoginPage);
  }
}
