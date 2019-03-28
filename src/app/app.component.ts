import { Component } from '@angular/core';
import { Platform, ToastController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService} from '@ngx-translate/core';
import { Proveedor1Provider} from '../providers/proveedor1/proveedor1'; 
import { Geofence } from '@ionic-native/geofence';
import { Storage } from "@ionic/storage";
//import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  //rootPage = 'Promotion-detailPage';
   rootPage:any = '';
   //setRoot: any='';

   geofencePlugin: any;


  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private translateService: TranslateService,
    public proveedor: Proveedor1Provider,
    private geofence: Geofence,
    private st: Storage,
    private toastCtrl: ToastController,
    public events: Events
    //private backgroundMode: BackgroundMode
  ) {

    this.platform.ready().then(() => {


      this.geofencePlugin =  (<any>window).geofence;
      //this.backgroundMode.enable();

      //Language
      this.translateService.setDefaultLang('es');
      this.translateService.use('es');

     
      //this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#ffffff');
      this.statusBar.styleDefault();
      //this.statusBar.styleDefault();



      geofence.initialize().then(
        // resolved promise does not return a value
        () => {
          // this.presentToast('Geofence Plugin Ready');
          console.log('Geofence Plugin Ready');
        },
        (err) => console.log(err)
      )

      this.geofence.onNotificationClicked()
      .subscribe(
      (resp) => {
        // this.presentToast(JSON.stringify(resp));
        this.st.set('ls_notification_promo',resp);
        if (this.rootPage){
          this.events.publish('loadPromo');
        }
      },
      (err) => {
        console.error('ERROR NOTIFICACION',err);
        this.st.set('ls_notification_promo',undefined);
      });


    });

    setTimeout(() => {
      this.rootPage = 'SplashPage';
      this.splashScreen.hide();
    }, 3000);

    

  }


   presentToast(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
    });
    toast.present();
  }


}