import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import * as L from 'leaflet'; //MAPAS OFFLINE CON LEAFLET
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Zip } from '@ionic-native/zip';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
declare var cordova: any;
@IonicPage()
@Component({
  selector: 'page-sonidos',
  templateUrl: 'sonidos.html',
})
export class SonidosPage {
  storageDirectory: string = '';
  map : any; 

  nombre:string;
  frutas:any=[];


  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public storage: Storage,
    private file: File,
    private transfer: FileTransfer,
    private zip: Zip
  ) {

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

  //VISTA DE LOS MAPAS OFFLINE Y ONLINE
  ionViewDidLoad() {
   // this.mapa();
  this.nombre = 'HENRY';
  console.log(this.nombre);
  }
 
  mapa(){
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando mapas..'
      });
      loading.present();
      this.map = L.map('map').
       setView([ -0.1894296, -79.4814523],
       12); 
       loading.dismiss();
       L.tileLayer(this.file.dataDirectory+'archivos/mapa'+'/{z}/{x}/{y}.png', {maxZoom: 16, minZoom:12 }).addTo(this.map);
       this.map.locate({

      setView: true 

    }).on('locationfound', (e) => {
      var lugar = 'Mi ubicación';
      L.marker(e.latlng).addTo(this.map)
      .bindPopup("Tu te encuentras en: " + lugar + ".").openPopup();

      }).on('locationerror', (err) => {
        alert(err.message);
    })
  // create custom icon
    var firefoxIcon = L.icon({
    iconUrl: 'assets/icon/cafeteria.svg',
    iconSize: [38, 95], // size of the icon
    });

    // create marker object, pass custom icon as option, add to map         
    var marker = L.marker([-0.191295, -78.498816], {icon: firefoxIcon}).addTo(this.map)
    .bindPopup('<b>Lugar:</b> Mozilla Bar</br><b>Dirección:</b> Av. 10 de agosto').openPopup();

    L.marker([-0.188548, -78.509781]).addTo(this.map)
    .bindPopup('<b>Lugar:</b> Cofee</br><b>Dirección:</b> Av. 10 de agosto').openPopup();
  }

}
