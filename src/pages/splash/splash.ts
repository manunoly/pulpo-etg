import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Proveedor1Provider} from '../../providers/proveedor1/proveedor1'; 
import { Storage } from "@ionic/storage";
import { Geofence } from '@ionic-native/geofence';

@IonicPage()
@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
})
export class SplashPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public proveedor: Proveedor1Provider,
    private st: Storage,
    private geofence: Geofence,
  ) {

    this.proveedor.checkLogin();

    this.proveedor.authUser.subscribe(jwt => {
      console.log("SESION ---->",jwt);
      if (jwt) {
        
        this.st.get('ls_notification_promo').then( (notificacion) => {
          console.log('LS ----------->', notificacion);
          if(notificacion){
            //this.navCtrl.setRoot('ConfiguracionPage')
            this.navCtrl.setRoot('TabsPage', { ciudad: notificacion.ciudad.toLowerCase(), valor: false, coordenadas: [ parseFloat(notificacion.ciudad_lat), parseFloat(notificacion.ciudad_log) ], id_ciudad: notificacion.id_ciudad,  tabIndex: 1, store_id: notificacion.establecimientos_id });
          }else{
            this.navCtrl.setRoot('ConfiguracionPage');
          }
          
        });
    

      }else {
        this.navCtrl.setRoot('IdiomaPage');
      }
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SplashPage');
  }

}
