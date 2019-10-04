import { TranslateService } from '@ngx-translate/core';
import { Component,  ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

import { LoadingController } from 'ionic-angular';
import { IonicPage,AlertController } from 'ionic-angular';
import {Proveedor1Provider} from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import {Storage} from "@ionic/storage";
import {NgForm} from '@angular/forms';
import {NgModel} from "@angular/forms";
import {TerminosPage} from '../terminos/terminos';
import {ResetpasswordPage} from '../resetpassword/resetpassword';

// @IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  usuarios;  //Variable en donde se van a guardar los datos traidos por JSON
  opcion: string = "iniciar";   //Inicializar segmento
  @ViewChild('username')
  usernameModel: NgModel;
  isChecked:boolean;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public proveedor: Proveedor1Provider,
    private readonly storage: Storage,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {
    
  }

  
  ionViewDidLoad(){
      
      this.proveedor.obtenerdatos()
      .subscribe(
        (data)=>{this.usuarios = data;},
        (error)=>{console.log(error);}
      )
  }

  terminos(){
    this.navCtrl.push(TerminosPage);
  }

  resetpassword(){
    this.navCtrl.push(ResetpasswordPage);
  }

  login(data){
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: '...'
    });

    loading.present();
    //console.log(data);

  this.proveedor.login(data).then((result) => {
      loading.dismiss();
      console.log(result);
      this.storage.get('ls_firstStart').then(firstStart => {

        if(!firstStart){
          this.navCtrl.setRoot('StepsPage');
        }else{
          this.navCtrl.push('ConfiguracionPage');
        }

      });
  }, async (err) => {
    
      const msg = await this.translate.get('P1:LOGINERROR').toPromise();

      loading.dismiss();
      console.log(err);
      
      let alert = this.alertCtrl.create({
        title: '<b>Error</br></b>',
        subTitle: msg,
        buttons: ['OK']
      });
      alert.present();
  });


  }


  //REGISTRO EN LA APLICACIÓN

  signup(f: NgForm) {
    
    let value = f.value;

   /* if(!this.isChecked){
      this.message({status : true , text:"Debe aceptar las políticas de privacidad.", title:'Atención'});
      return;
    }*/

    if((value.name).length < 2){
      this.message({status : true , text:"Tu nombre debe tener más de 2 caracteres.", title:'Advertencia'});

      return;

    }

    if((value.password).length < 6){
      this.message({status : true , text:"La contraseña debe ser mayor a 6 dígitos.", title:'Advertencia'});
      return;
    }

    /*if(value.password !== value.password_confirmation){
      this.message({status : true , text:"Las contraseñas no son iguales.", title:'Advertencia'});
      return;
    }*/
    
  
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Espere ...'
    });

    loading.present();

    

    this.proveedor.signup(value).then((result) => {
        let form_login = {
          email : value.email,
          password: value.password
        }

        /**
         * INICIAR SESION
         */
        
        this.proveedor.login(value).then((result) => {
          
          console.log(result);
          loading.dismiss();
          this.message({status : true , text:"Tu cuenta se ha creado correctamente.", title:'Éxito'});
          this.navCtrl.setRoot('StepsPage');
          
        }, (err) => {
            loading.dismiss();
        });

        
        /*
        this.message({status : true , text:"Hemos enviado un mail de confirmación, por favor verifique su cuenta.", title:'Registro exitoso'});

        f.resetForm();

        this.navCtrl.setRoot('LoginPage');
        */
       


    }, (error) => {
      
      let message: string;
      if( error.error){
        

        //let error = JSON.parse(err._body);
        if(error.error.email){
          this.message({status : true , text:"El correo ya se encuentra registrado. Si deseas recuperar la contraseña, utiliza el link.", title:'Atención'});

        }else if(error.error.name){
          this.message({status : true , text:"El nombre debe ser mayor a 2 caracteres.", title:'Atención'});

        }else{
          this.message({status : true , text:"Lo sentimos, error inesperado.", title:'Advertencia'});

        }
   
        
   
      }else{
        
        if(error.isTrusted){
          this.message({status : true , text:"Se ha perdido la conexión con el servidor.", title:'Advertencia'});
          loading.dismiss();
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
