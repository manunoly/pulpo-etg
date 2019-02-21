import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform,LoadingController ,AlertController } from 'ionic-angular';
import { File } from '@ionic-native/file'; 
import { Storage } from "@ionic/storage";
import {Proveedor1Provider} from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import { Network } from '@ionic-native/network';

@IonicPage()
@Component({
  selector: 'page-exito-escaneo',
  templateUrl: 'exito-escaneo.html',
})
export class ExitoEscaneoPage {

  promocion:any = [];
  storageDirectory: string;
  ratingdata = [];
  internet:boolean = false;
  
  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private file: File,
    private st: Storage,
    public proveedor: Proveedor1Provider,
    public platform: Platform,
    private network: Network,
    public alertCtrl: AlertController,
  ) {


    this.st.get('ls_detalle_promo').then((ls_detalle) => { 
      this.promocion = ls_detalle;
      this.inicializar();

    });

  }


  inicializar(){
    this.ratingdata = this.proveedor.ScoreDefault();

    this.platform.ready().then(() => {

      if (!this.platform.is('cordova')) {
        this.obtenerCalificacion(true);
      }else{

        if ( this.network.type !== 'none' && this.network.type !== 'unknown' ) {
          console.log('Estas conectado a internet')
          this.obtenerCalificacion(true);
          this.internet = true;

        }else{
          this.obtenerCalificacion();
          this.internet = false;

        }

      }

    });
  }



  continuar(){
    this.navCtrl.pop();
    //this.navCtrl.setRoot('TabsPage');
  }


  calificar(establecimientoid,ratingId){

    if(!this.internet){
      this.alert('Lo sentimos', 'Para calificar necesita conexion a internet.' );
    }

    console.log('CALIFICAR',ratingId);

    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Calificando ...'
    });
    loading.present();

    let form = {
      id_establecimiento :  establecimientoid,
      calificacion :  ratingId+1
    };

    this.proveedor.calificar( form ).then((calificacion) => {

      console.log('CALIFICAR', calificacion);

      this.promocion['scores'] = this.ratingdata;

      for(let i = 0; i < this.ratingdata.length ; i++){
        if(i <= ratingId){
          this.ratingdata[i].icon = true;
        }else{
          this.ratingdata[i].icon = false;
        }
      }

      this.alert('Éxito', calificacion[0] );
      loading.dismiss();
     
      
    }, (err) => {
      if(err.error){
        this.alert(err.titulo,err.error);
      }
      loading.dismiss();
      console.log(err);
    });

  }


  obtenerCalificacion(internet?){
    let loading = this.loadingCtrl.create({
      content: "Obteniendo calificación",
    });
    loading.present();


    this.proveedor.obtener_calificaciones( parseInt(this.promocion.establecimientos_id) ,internet).then((calificacion) => {

      console.log('CALIFICACION', calificacion, 'de ', parseInt(this.promocion.establecimientos_id) );
      let number;
      if(!calificacion){
        number = 0;
      }else{
        number = calificacion;
      }

      let estrellas = this.proveedor.get_list_stars(number);

      console.log('estrellas',estrellas);

      this.promocion['scores'] = estrellas;

      console.log(this.promocion);
      
      loading.dismiss();
      
    }, (err) => {
      loading.dismiss();
      console.log(err);
    });
  }

  alert( title, message){
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['Aceptar']
    });
    alert.present();
  }



}
