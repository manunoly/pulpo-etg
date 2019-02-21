import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController,LoadingController,ModalController,Events,normalizeURL } from 'ionic-angular';
import { File } from '@ionic-native/file'; 
import { Storage } from "@ionic/storage";
import { BarcodeScanner,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { ASSETS_URL } from "../../config";
import { Proveedor1Provider } from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-promotion-detail',
  templateUrl: 'promotion-detail.html',
})
export class PromotionDetailPage {

  galeria:any=[];
  titulo:any;
  ciudad_actual:any;
  promocion:any = [];
  storageDirectory: string;
  options :BarcodeScannerOptions;
  scanData:string;
  internet: boolean = false;
  promociones_escaneadas:any = [];
  ratingdata = [];
  mensajes: any = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private file: File,
    public platform: Platform,
    private st: Storage,
    private barcodeScanner: BarcodeScanner,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public proveedor: Proveedor1Provider,
    private network: Network,
    private statusBar: StatusBar,
    translate: TranslateService
  ) {

    let mensajes;
    translate.get('promotion_detail').subscribe(
      value => {
        mensajes = value;
      }
    )
    this.mensajes = mensajes;

    if(!navParams.get("promo")){

      this.st.get('ls_detalle_promo').then((ls_detalle) => { 
        this.promocion = ls_detalle;
      });

    }else{
      this.promocion = navParams.get("promo");
    }


    this.ratingdata = this.proveedor.ScoreDefault();

    this.platform.ready().then(() => {
      
      if (!this.platform.is('cordova')) {
        this.storageDirectory = ASSETS_URL+'';
        console.log('local-app',this.storageDirectory);
        this.obtenerCalificacion(true);
        return;
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


      if (this.platform.is('ios')) {
        this.storageDirectory = normalizeURL(cordova.file.documentsDirectory);
        return;

      }else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;
        return;

      }

    });

 

  }

  obtenerGalerias(fotos){
    return JSON.parse(fotos);
  }

  cerrar(){
    this.navCtrl.pop();
  }

  escanear(){

    this.statusBar.hide();

    this.options = {
        prompt : this.mensajes.escanea     //Cambio Lenguaje
    }
    this.barcodeScanner.scan(this.options).then((barcodeData) => {

        this.scanData = barcodeData.text;

        if(barcodeData.text == ""){
          
          this.alert(this.mensajes.lo_sentimos,this.mensajes.qr);
        }else{
          console.log(barcodeData);
          this.validar_enlinea(barcodeData.text );
          //this.get_company( this.scanData );
        }

        this.statusBar.show();
        
    }, (err) => {
        console.log("Error occured : " + err);
        this.alert(this.mensajes.lo_sentimos, this.mensajes.acceso_camara);
    });
  }



  validar_enlinea( codigo){
    this.platform.ready().then(() => {
      console.log(this.network.type);
      if ( this.network.type !== 'none' && this.network.type !== 'unknown' ) {
        console.log('Estas conectado a internet')
        this.internet = true;
        this.validar_guardar(codigo);
        this.guardarls(codigo);
      }else{
        this.guardarls(codigo,true);
      }

    });
  
  }


  establecimiento_encontrado:number = 0;
  guardarls(codigo, mensajes? ){

    this.establecimiento_encontrado = 0;
    this.st.get('ls_establecimientos').then( (establecimientos) => {

      for(let x=0; x < establecimientos.length ; x++){
        if(establecimientos[x]['qr_code'] == codigo){
          this.establecimiento_encontrado = establecimientos[x]['id'];
        }
      }

      console.log('ESTABLECIMENTO ENCONTRADO',this.establecimiento_encontrado,this.promocion.establecimientos_id);
      if( this.establecimiento_encontrado !== parseInt(this.promocion.establecimientos_id)){
        if(mensajes){
          this.alert(this.mensajes.lo_sentimos, this.mensajes.qr2);
        }
        return;
      }

      this.st.get('ls_promociones_escaneadas').then((pe) => { 

        console.log('PROMOCIONES ESCANEADAS',pe);

        if(!pe){

          this.promociones_escaneadas = [
            {
              codigo_qr :  codigo,
              promocion_id : this.promocion.id
            }
          ]

          if(mensajes){
            this.alert(this.mensajes.exito, this.mensajes.promocion_correcta);
          }
          this.st.set('ls_promociones_escaneadas', this.promociones_escaneadas);

        }else{

          let s;
          for(s = 0; s < pe.length; s++){

            console.log('VALIDACION',pe[s]['promocion_id'] , this.promocion.id  );
            if(pe[s]['promocion_id'] ==  this.promocion.id ){
              if(mensajes){
                this.alert(this.mensajes.lo_sentimos,this.mensajes.ya_esta_escaneado);
              }
              return;
            }

          }

          
          this.promociones_escaneadas = pe;

          let form = {
            codigo_qr :  codigo,
            promocion_id : this.promocion.id
          }

          this.promociones_escaneadas.push(form);
          this.st.set('ls_promociones_escaneadas', this.promociones_escaneadas );

          if(mensajes){
            this.alert(this.mensajes.exito, this.mensajes.ya_esta_escaneado);
          }
          
          console.log('ESCANEO FINALIZADO', this.promociones_escaneadas );

        }
        
      });


    });

    

    

  }



  validar_guardar(codigo){
    
    let loading = this.loadingCtrl.create({
      content: this.mensajes.validando,
    });
    loading.present();

    let form = {
      codigo_qr :  codigo,
      promocion_id : this.promocion.id
    };

    this.proveedor.enviar_codigoqr(form).then((resultado) => {
      console.log('RESULTADO ESCANEO', resultado);

      if(resultado){
        this.alert(this.mensajes.exito, resultado[0]);
        this.navCtrl.push('ExitoEscaneoPage');

      }else{
        this.alert(this.mensajes.lo_sentimos, this.mensajes.error_inesperado);
      }

      loading.dismiss();
      
    }, (err) => {
      loading.dismiss();
      if(err.error){
        this.alert(err.titulo, err.error);
      }
      console.log(err);
    });

  }



  alert( title, message){
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [this.mensajes.aceptar]
    });
    alert.present();
  }

  ver_info(promocion){
    console.log("00000000000000000000",promocion);
    let descriptionModal = this.modalCtrl.create('DescriptionPage', { nombre: promocion.establecimiento, descripcion: promocion.descripcion, imagen: promocion.logo, direccion:promocion.direccion, email:promocion.email, telefono:promocion.telefono, web:promocion.web, galerias:this.galeria});
    descriptionModal.present();   
    console.log("Logo del establecimiento",this.promocion.logo ,this.galeria);
  }
  

  ver_mapa(){
    this.st.get('ls_ciudad_actual').then(resultado => {
      this.navCtrl.push('MapaPage', { nombre:this.promocion.establecimiento, ciudad:resultado, latitud:this.promocion.latitud, longitud:this.promocion.longitud, direccion:this.promocion.direccion, categorias_id: this.promocion.categoria_id});
    });
  }


  obtenerCalificacion(internet?){
    let loading = this.loadingCtrl.create({
      content: this.mensajes.obteniendo_calificacion,
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

}



