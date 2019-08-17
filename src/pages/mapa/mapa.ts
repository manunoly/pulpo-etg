import { Component } from '@angular/core';
import { IonicPage, NavParams, Platform, AlertController,LoadingController,normalizeURL } from 'ionic-angular';
import * as L from 'leaflet'; //MAPAS OFFLINE CON LEAFLET
import { File } from '@ionic-native/file';
import { ASSETS_URL } from "../../config";
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-mapa',
  templateUrl: 'mapa.html',
})
export class MapaPage {
  storageDirectory: string = '';
  map: any;
  ciudad_recibida: string;
  latitud:any;
  longitud:any;
  direccion:any;
  nombre:any;
  categorias_id:any;
  isDevice:boolean = false;
  internet: boolean = false;
  distancia: any = [];
  mensajes: any = [];

  constructor(
    public navParams: NavParams,
    public platform: Platform,
    public st: Storage,
    private file: File,
    public alertCtrl: AlertController,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    private network: Network,
    translate: TranslateService
  ) {

    
    let mensajes;
    translate.get('offlinemaps').subscribe(
      value => {
        mensajes = value;
      }
    )
    this.mensajes = mensajes;

    this.nombre=navParams.get("nombre");
    this.latitud=navParams.get("latitud");
    this.longitud=navParams.get("longitud");
    this.ciudad_recibida = navParams.get("ciudad");
    this.direccion=navParams.get("direccion");
    this.categorias_id=navParams.get("categorias_id");

    console.log('Este valor se recibe aqui', this.ciudad_recibida,this.latitud,this.longitud,'Categorias: ',this.categorias_id);

      //DIRECCION DE LA CARPETA EN DONDE SE VAN A GUARDAR LOS ARCHIVOS
    this.platform.ready().then(() => {

      console.log(this.network.type);
      if ( this.network.type !== 'none' && this.network.type !== 'unknown' ) {
        console.log('Estas conectado a internet')
        this.internet = true;
      }


      if (!this.platform.is('cordova')) {
        this.storageDirectory = ASSETS_URL + '';
        console.log('local-app', this.storageDirectory);
        return;
      }
      if (this.platform.is('ios')) {
        this.storageDirectory = normalizeURL(this.file.documentsDirectory);
        this.isDevice = true;

      } else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;
        this.isDevice = true;
      }
    });
    
  }

  ionViewDidEnter() {

    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: this.mensajes.ubicacion
    });
    loading.present();

    console.log('ionViewDidLoad MapaPage');
    let options = {
        enableHighAccuracy : false
    };

    this.geolocation.getCurrentPosition(options).then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      this.mapa(resp);
      console.log('Ubicacion correcta',resp);
      loading.dismiss();
    }).catch((error) => {
      console.log('Ubicacion error: ',error);
      loading.dismiss();

    });
    
  }

    /**
   * MAPAS OFFLINE
   */
  mapa(mi_ubicacion) {
    
    this.map = L.map('map1').
    setView([this.latitud,this.longitud],13);

    if(!this.isDevice){
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 13 }).addTo(this.map);
    }else{

      if(!this.internet){
        L.tileLayer( this.storageDirectory + this.ciudad_recibida + '/' + this.ciudad_recibida + '/{z}/{x}/{y}.png' , { maxZoom: 18, minZoom: 13 }).addTo(this.map);
      }else{
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 13 }).addTo(this.map);
      }

    }
    

    console.log('MI UBICACION',mi_ubicacion);

    var firefoxIcon = L.icon({
      iconUrl: 'assets/icon/ubicacion.png',
      iconSize: [33, 50], // size of the icon
    });

    L.marker([mi_ubicacion.coords.latitude , mi_ubicacion.coords.longitude], { icon: firefoxIcon }).addTo(this.map)
    .bindPopup(this.mensajes.tu_te_encuentras_aqui)
    .openPopup();

    if(this.categorias_id==1){

      var icono = L.icon({
        iconUrl: 'assets/icon/icon_edif.png',
        iconSize: [33, 50], // size of the icon
      });
    L.marker([this.latitud , this.longitud], { icon: icono }).addTo(this.map)
    .bindPopup('<b>' + this.mensajes.lugar +':</b>' + this.nombre + '</br>' + '<b>' + this.mensajes.direccion +':</b>' + this.direccion)
    .addTo(this.map);

    } else if (this.categorias_id == 3) {

      var icono = L.icon({
        iconUrl: 'assets/icon/icon_igle.png',
        iconSize: [33, 50], // size of the icon
      });
    L.marker([this.latitud , this.longitud], { icon: icono }).addTo(this.map)
    .bindPopup('<b>' + this.mensajes.lugar +':</b>' + this.nombre + '</br>' + '<b>' + this.mensajes.direccion +':</b>' + this.direccion)
    .addTo(this.map);

    }else if (this.categorias_id == 4) {

      var icono = L.icon({
        iconUrl: 'assets/icon/icon_mus.png',
        iconSize: [33, 50], // size of the icon
      });
    L.marker([this.latitud , this.longitud], { icon: icono }).addTo(this.map)
    .bindPopup('<b>' + this.mensajes.lugar +':</b>' + this.nombre + '</br>' + '<b>' + this.mensajes.direccion +':</b>' + this.direccion)
    .addTo(this.map);

    }else if (this.categorias_id == 2) {

      var icono = L.icon({
        iconUrl: 'assets/icon/icon_plaz.png',
        iconSize: [33, 50], // size of the icon
      });
    L.marker([this.latitud , this.longitud], { icon: icono }).addTo(this.map)
    .bindPopup('<b>' + this.mensajes.lugar +':</b>' + this.nombre + '</br>' + '<b>' + this.mensajes.direccion +':</b>' + this.direccion)
    .addTo(this.map);

    }else{
      L.marker([this.latitud , this.longitud]).addTo(this.map)
      .bindPopup('<b>' + this.mensajes.lugar +':</b>' + this.nombre + '</br>' + '<b>' + this.mensajes.direccion +':</b>' + this.direccion)
      .addTo(this.map);
    }

    this.map.fitBounds([ [mi_ubicacion.coords.latitude , mi_ubicacion.coords.longitude],[this.latitud , this.longitud] ]);

    let d_ = this.getDistance( [mi_ubicacion.coords.latitude , mi_ubicacion.coords.longitude], [this.latitud , this.longitud]  );
    this.distancia.metros = d_.toFixed(2);
    this.distancia.kilometros = (this.distancia.metros / 1000).toFixed(2);

    console.log('DISTANCIA: ', this.distancia);

  }



  getDistance(origin, destination) {
    // return distance in meters
    var lon1 = this.toRadian(origin[1]),
        lat1 = this.toRadian(origin[0]),
        lon2 = this.toRadian(destination[1]),
        lat2 = this.toRadian(destination[0]);

    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;

    var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS * 1000;
  }



  toRadian(degree) {
    return degree*Math.PI/180;
  }

  
  
}
