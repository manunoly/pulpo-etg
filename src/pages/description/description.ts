import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform,normalizeURL } from 'ionic-angular';
import { ModalController, ViewController } from 'ionic-angular';
import { ASSETS_URL } from "../../config";
import { File } from '@ionic-native/file'; 
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { Network } from '@ionic-native/network';

@IonicPage()
@Component({
  selector: 'page-description',
  templateUrl: 'description.html',
})
export class DescriptionPage {
  @ViewChild('slides') slides: Slides;
  map: any;
  slides1: any = [];
  nombre: any;
  descripcion:any;
  imagen:any;
  audio: any;
  ciudad_actual:any;
  storageDirectory: string;
  latitud:any;
  longitud:any;
  direccion:any;
  galerias:any;
  email:any;
  telefono:any;
  web:any;
  categorias_id:any;
  promocion:any = [];

  constructor(

    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public viewCtrl: ViewController,
    public st: Storage,
    private file: File,
    private network: Network
  ) {
    this.galerias=navParams.get("galerias");
    this.ciudad_actual = navParams.get("ciudad");
    this.nombre = navParams.get("nombre");
    this.descripcion = navParams.get("descripcion");
    this.imagen = navParams.get("imagen");
    this.latitud = navParams.get("latitud");
    this.longitud = navParams.get("longitud");
    this.email = navParams.get("email");
    this.telefono = navParams.get("telefono");
    this.web = navParams.get("web");
    this.direccion = navParams.get("direccion");
    this.categorias_id = navParams.get("categorias_id");

     console.log('Datos que se reciben descripcion--->',this.nombre,this.latitud,this.longitud,this.direccion, this.imagen,this.galerias, this.email, this.web, this.telefono ,this.categorias_id);

    if( navParams.get("audio")){
      let info_archivo = JSON.parse( navParams.get("audio") );
      this.audio = this.format_ur( info_archivo[0]['download_link']) ;
    }

   

    //console.log('Este valor se recibe aqui ' + this.nombre + ''+ this.descripcion+' Audio: '+ this.audio);
    
    this.platform.ready().then(() => {
      
      if (!this.platform.is('cordova')) { 
        this.storageDirectory = ASSETS_URL+'';
        console.log('local-app',this.storageDirectory);
        return;
      }
      if ( this.network.type !== 'none' && this.network.type !== 'unknown' ) {
        console.log('Estas conectado a internet')
        this.storageDirectory = ASSETS_URL + '';
      }else{
      if (this.platform.is('ios')) {
        this.storageDirectory = normalizeURL(this.file.documentsDirectory);

      }else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;
      }
    }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DescriptionPage');
  }

 
  carga_establecimientos() {

    this.st.get('ls_establecimientos').then(resultado => {

      console.log('TODOS ESTABLECIMIENTOS',resultado); 

      if(resultado.galeria){
        for (let i = 0; i < resultado.galeria.length; i++) {
          if (resultado[i]['nombre'] == this.nombre) { //-------------------------------->
            console.log('ESTABLECIMIENTO -->',resultado[i]);
            this.slides1.push(resultado[i]);
            console.log('direccion galerias',this.slides1.galeria.imagen);
          }
        }
      }else{
        console.log("no hay galeria")
      }
     
      
    });
  }

  salir() {
    this.viewCtrl.dismiss();
  } 

  ver_mapa(){
    this.navCtrl.push('MapaPage', { nombre:this.nombre, ciudad: this.ciudad_actual, latitud:this.latitud, longitud:this.longitud, direccion:this.direccion, categorias_id: this.categorias_id});
    console.log('Valor que se envia',this.ciudad_actual);
  }


  format_ur(string_url){
    let url;
    try {
      url =  string_url.replace(/\\/g, "/");
    }
    catch(err) {
      url = string_url;
    }

    return url;
  }

 
}
