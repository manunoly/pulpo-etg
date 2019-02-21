import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform,AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from 'ionic-angular';
import {Proveedor1Provider} from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import {Storage} from "@ionic/storage";
import { Zip } from '@ionic-native/zip';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
declare var cordova: any;
@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {
  storageDirectory: string = '';
  establecimientos: any[]; //Variable en donde se van a guardar los datos traidos por JSON
  searchQuery: string = '';
  private result: any[];
  constructor(public navCtrl: NavController,
    private http: HttpClient,
    public loadingCtrl: LoadingController,
    public proveedor: Proveedor1Provider,
    private storage: Storage,
    public alertCtrl: AlertController,
    public platform: Platform,
    private file: File,
    private transfer: FileTransfer,
    private zip: Zip) {

    
      
       //DIRECCION DE LA CARPETA EN DONDE SE VAN A GUARDAR LOS ARCHIVOS
    this.platform.ready().then(() => {
      // make sure this is on a device, not an emulation (e.g. chrome tools device mode)
      if(!this.platform.is('cordova')) {
        return false;
      }

      if (this.platform.is('ios')) {
        this.storageDirectory = cordova.file.documentsDirectory;
      }
      else if(this.platform.is('android')) {
        this.storageDirectory = cordova.file.data;
      }
      else {
        // exit otherwise, but you could add further types here e.g. Windows
        return false;
      }
    });    
  }

  imagen: string;
  direccion:any;

  categorias:any=[];

  ionViewDidLoad(){

   // this.initializeItems();
   this.proveedor.obtenerdatos()
   .subscribe(
     (data) => { // Success
       this.establecimientos = data['nombre'];
     },
     (error) =>{
       console.error(error);
     }
   )
}

descargauio(){
  this.storage.get('ls_mapa').then((val) => {
    if(val!=true){
      this.confirmacion();
   }
  });
  
  this.proveedor.obtenerdatos()
  .subscribe(
    (data)=>{
      
      this.categorias = data;

      for(let i = 0; i< data['length']; i++ ){

        this.categorias[i] = data[i]['name']+''+data[i]['id'];

      }

      console.log(data,this.categorias);

    },
    (error)=>{console.log(error);}
  )
}

confirmacion(){
  //Código para dar la autorización de descargarse los mapas offline
  let confirm = this.alertCtrl.create({
    title: 'Advertencia!',
    message: 'Es necesario descargar los mapas para navegar offline. Revisa que te encuentres conectado a una zona WiFi.',
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
          this.descargar();
        }
      }
    ]
  });
  confirm.present();
}

descargar(){

  //Código para descargarse el mapa
  const url = 'http://etg.boxqos.com/multimedia/archivos.zip';
  let fileTransfer: FileTransferObject = this.transfer.create();

  let loader = this.loadingCtrl.create({
    content: "Descargando contenido...",
  });
  loader.present();
  this.platform.ready().then(() => {

    fileTransfer.download(url, this.file.dataDirectory+'archivos.zip').then((entry) => {
      console.log('Descarga completa  : ' + entry.toURL());
      this.imagen= entry.toURL();
      loader.dismiss();
      
      setTimeout(() => {     //Descompresion despues de la descarga
        this.descomprimir();
      }, 1000);
    
    }, (error) => {
      // handle error
      console.log('ERROR',error);
      loader.dismiss();
    });
  });
}
//UNZIP
descomprimir(){

  let loader = this.loadingCtrl.create({
    content: "Descomprimiendo contenido...",
  });
  loader.present();

  console.log('AQUI SE GUARDA',this.file.dataDirectory+'archivos');

    this.zip.unzip(this.file.dataDirectory+'archivos.zip', this.file.dataDirectory+'archivos', (progress) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%'))
  .then((result) => {
    console.log(result);
    loader.dismiss();
    if(result === 0){
      this.storage.set('ls_mapa',true);
    }
    if(result === -1) console.log('FALLO');
  });}


  //EJEMPLO CON DATOS OFFLINE
 /* initializeItems() {
    this.items1 = [
          {
      "ciudad": "Quito",
      "peso": "170MB"
 },
  {
    "ciudad": "Guayaquil",
      "peso": "200MB"
  }
    ];
  }
  /// FIN


  getItems(ev: any) {
     //Resetearvalores
     //this.obtenerCategorias();
     this.initializeItems(); //Ejemplo con datos quemados

    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items1 = this.items1.filter((item) => {  //Los dos valores se toman de la consulta a la api (nombre del array)
        return (item.ciudad.toLowerCase().indexOf(val.toLowerCase()) > -1); //Para obtener la ciudad
      })
    }

  }*/

}
