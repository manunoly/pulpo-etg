import { Component } from '@angular/core';
import { NavController, LoadingController, NavParams,AlertController  } from 'ionic-angular';
import {Proveedor1Provider} from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import {NgForm} from '@angular/forms';

@Component({
  selector: 'page-resetpassword',
  templateUrl: 'resetpassword.html',
})
export class ResetpasswordPage {

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private readonly resetProvider: Proveedor1Provider, 
    private readonly loadingCtrl: LoadingController,
    public alertCtrl: AlertController,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetpasswordPage');
  }

  reset(form: NgForm){

    let value = form.value;

    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Verificando ...'
    });

    loading.present();


    this.resetProvider.resetPassword(value).then((result) => {
        if(result){
          this.message({status : true , message: result['success'],text:"Te hemos enviado un correo electrónico", title : 'Éxito' });
          form.resetForm();
        }
        
        loading.dismiss();

    }, (error) => {


      console.log('el error',error);

      let message: string;

      if(error.error){
        this.message({status : true , text: 'El mail '+value.email+' no esta registrado.', title : 'Advertencia' });
   
      }else{
        if(error.isTrusted){
          this.message({status : true , text:"Se ha perdido la conexión con el servidor.", title:'Advertencia'});

        }else{
          message = `Error desconocido: ${error}`;
          this.message({status : true , text:"Lo sentimos, error inesperado."+message  , title:'Advertencia'});

        }
      }

      loading.dismiss();
    });

  }

  message(message){
    let alert;

    alert = this.alertCtrl.create({
      title: message.title,
      subTitle: message.text,
      buttons: ['Aceptar']
    });

    alert.present();
  }


}



