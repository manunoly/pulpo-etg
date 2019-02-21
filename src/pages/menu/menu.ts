import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav, AlertController, Platform } from 'ionic-angular';
import { Proveedor1Provider} from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import { componentFactoryName } from '@angular/compiler';
//import { AppVersion } from '@ionic-native/app-version';
import {Storage} from "@ionic/storage";
import { LoginPage } from '../login/login';
export interface PageInterface{
  title: string,
  pageName: string,
  tabComponent?: any,
  index?: number,
  icon: string
} 

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  rootPage = 'OfflinemapsPage';  //Pagina que va de inicio
  @ViewChild(Nav) nav: Nav;

  pages: PageInterface[] = [
    {title: 'Configuración', pageName: 'ConfiguracionPage', tabComponent: 'ConfiguracionPage', index:0 , icon:'person'}, //Nombre de las paginas a donde se va a dirigir la aplicacion
    {title: 'Ubicación Offline', pageName: 'OfflinemapsPage', tabComponent: 'OfflinemapsPage', index:1 , icon:'alarm'},
    {title: 'Audios', pageName: 'SonidosPage', tabComponent: 'ContactPage', index:2 , icon:'analytics'},
    {title: 'Configuración', pageName: 'ProfilePage', icon:'construct'}
  ]
  username; 
  useremail;
  versionapp;

  constructor(public navCtrl: NavController, 
    private readonly Proveedor1Provider: Proveedor1Provider,
    public alertCtrl: AlertController, 
    public navParams: NavParams,
    //private appVersion: AppVersion,
    private readonly platform: Platform,
    private readonly storage: Storage
  ) {

}


openPage(page: PageInterface){
  let params = {};
  
  if(page.index) {
    params = { tabIndex: page.index }
  }

  if(this.nav.getActiveChildNav() && page.index != undefined ){
    this.nav.getActiveChildNav().select(page.index);
  }else{
    this.nav.setRoot(page.pageName, params);
  }
}

isActive(page: PageInterface){

  let childNav = this.nav.getActiveChildNav();

  if(childNav){
    if(childNav.getSelected() && childNav.getSelected().root === page.tabComponent){
      return 'active';
    }

    return;
  }

  if(this.nav.getActive() && this.nav.getActive().name == page.pageName){
    return 'active'
  }

}

showConfirm() {

  let confirm = this.alertCtrl.create({
    title: 'Advertencia!',
    message: 'Está seguro que desea cerrar la sesión?',
    buttons: [
      {
        text: 'Cancelar',
        handler: () => {
          console.log('Disagree clicked');
        }
      },
      {
        text: 'Aceptar',
        handler: () => {
          this.Proveedor1Provider.logout();
          this.navCtrl.setRoot(LoginPage);
        }
      }
    ]
  });
  confirm.present();
}

logout() {
  this.showConfirm();
}
}