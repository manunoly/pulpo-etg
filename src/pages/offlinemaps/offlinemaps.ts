import { Component, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController,LoadingController,ModalController,Events,normalizeURL } from 'ionic-angular';
import * as L from 'leaflet'; //MAPAS OFFLINE CON LEAFLET
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { ASSETS_URL } from "../../config";
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Geofence } from '@ionic-native/geofence';
import { TranslateService } from '@ngx-translate/core';
declare var cordova: any;
import { ToastController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-offlinemaps',
  templateUrl: 'offlinemaps.html',
})
export class OfflinemapsPage {
  storageDirectory: string = '';
  map: any;
  map1:any;
  nombre: string;
  ciudad_recibida: string;
  markers: any = [];
  markers_base: any = [];
  l_markers:any = [];
  valor: boolean;
  coordenadas_recibidas: any;
  categorias: any = [];
  id_categoria: any;
  id_ciudad_recibida:any;
  isDevice:boolean = false;

  latitud:any;
  longitud:any;
  internet: boolean = false;
  first_load:number = 0;
  mi_marcador : any;
  mensajes: any = [];
  fence: any = [];
  distancia:number = 300;
  showPromo = false;
  msg;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public st: Storage,
    private file: File,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private elementRef: ElementRef,
    public events: Events,
    private geolocation: Geolocation,
    private network: Network,
    private geofence: Geofence,
    translate: TranslateService,
    public toastCtrl: ToastController
  ) {

    this.st.get('ls_notificacion').then((resultado) => {

      if(resultado){
        this.distancia = resultado.distancia;
        console.log("ESTA ES LA DISTANCIA PTOS",this.distancia);
      }

    }).catch(_=>{
      this.distancia = 300;
      console.log("error teniendo la distacia, utilizo por defecto 300");
    });

    let mensajes;
    translate.get('offlinemaps').subscribe(
      value => {
        mensajes = value;
        this.mensajes = mensajes;

      }
    )

    platform.registerBackButtonAction(() => {
      console.log("Retroceso negado");
    }, 1);


    this.ciudad_recibida = navParams.get("ciudad");
    console.log('Este valor se recibe aqui ' + this.ciudad_recibida);
    this.valor = navParams.get("valor");
    console.log('Este valor localizacion se recibe aqui ' + this.valor);
    this.coordenadas_recibidas = navParams.get("coordenadas");
    console.log('Este valor se recibe aqui ' + this.coordenadas_recibidas);

    this.id_ciudad_recibida = navParams.get("id_ciudad");
    console.log('Este valor se recibe aqui ' + this.id_ciudad_recibida);


    //DIRECCION DE LA CARPETA EN DONDE SE VAN A GUARDAR LOS ARCHIVOS
    this.platform.ready().then(() => {

      if (!this.platform.is('cordova')) {
        this.storageDirectory = ASSETS_URL + '';
        console.log('local-app', this.storageDirectory);
        return;
      }


      console.log(this.network.type);
      if ( this.network.type !== 'none' && this.network.type !== 'unknown' ) {
        console.log('Estas conectado a internet')
        this.internet = true;
      }

      if (!this.platform.is('cordova')) {
        this.internet = true;
      }

      if (this.platform.is('ios')) {
        this.storageDirectory =  normalizeURL(cordova.file.documentsDirectory);
        this.isDevice = true;

      } else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;
        this.isDevice = true;
      }


    }).catch();



    this.geofence.initialize().then(
      () =>{
        // this.presentToast('Geofence Plugin Ready too add');
        this.addGeofence();
      },
      (err) => console.log(err)
    ).catch(_=>{
      // this.presentToast('ERRRRooooor Geofence Plugin Ready too add');

    })
    // this.addGeofence();

    //ejecutar localizarme
    setTimeout(() => {
      this.localizarme();
    }, 3500);
    this.ionViewDidEnterFuntion();
  }

  async ionViewWillEnter(){
    // setTimeout(() => {
    //   this.localizarme();
    // }, 3500);
  }

  presentToast(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
    });
    toast.present();
  }


  addGeofence() {
    this.fence = [];
    //options describing geofence -0.181107, -78.480331
    // this.presentToast('addGeofence for');

    this.st.get('ls_promociones').then((resultado) => {
      // this.presentToast('Tengo PROMOCIONES :' + resultado.length);

      for (let i = 0; i < resultado.length; i++) {

        // console.log(parseFloat(resultado[i]['latitud']), parseFloat(resultado[i]['longitud']));
        let data = {
          id: resultado[i]['id'], //any unique ID
          latitude: parseFloat(resultado[i]['latitud']), //center of geofence radius
          longitude: parseFloat(resultado[i]['longitud']),
          radius: this.distancia, //radius to edge of geofence in meters
          transitionType: 1, //see 'Transition Types' below
          notification: { //notification settings
            id: resultado[i]['id'], //any unique ID
            title: resultado[i]['establecimiento'], //notification title
            text: resultado[i]['titulo'], //notification body
            icon: this.storageDirectory+resultado[i]['logo'],
            openAppOnClick: true, //open app when notification is tapped
            data: {store_id:resultado[i].establecimientos_id, ciudad: resultado[i].ciudad?resultado[i].ciudad:'Quito', id_ciudad:resultado[i].id_ciudad?resultado[i].id_ciudad:5, valor: false, ciudad_lat:parseFloat(resultado[i]['latitud']),ciudad_log:parseFloat(resultado[i]['longitud'])}
          }
        } 
        this.fence.push(data);
        // console.log(data.notification.data);
      }

      // console.log('meto al fence',this.fence );

      this.geofence.addOrUpdate(this.fence).then(
        respuesta => {
          // this.presentToast(this.fence.length + ' added ');
          // this.geofence.onTransitionReceived().subscribe((notificacion) => {
          //   this.presentToast(notificacion?JSON.stringify(notificacion):'onTransitionReceived');
          // });
          // this.geofence.onNotificationClicked()
          // .subscribe(
          // (notificacion) => {
          //   // this.presentToast(notificacion?JSON.stringify(notificacion):'onNotificationClicked subscription');
          //   this.st.set('ls_notification_promo',notificacion);
          //   this.navCtrl.setRoot('PromotionsPage', { tabIndex: 1, store_id: notificacion.store_id });
          // },
          // (err) => {
          //   // this.presentToast('ERROR NOTIFICACION'+JSON.stringify(err));
          //   this.st.set('ls_notification_promo',undefined);
          // });
        
        },
        (err) => console.log('Geofence failed to add', err)
      );


    });
  
  }

  //VISTA DE LOS MAPAS OFFLINE Y ONLINE
  ionViewDidEnterFuntion() {
    // if(!this.ciudad_recibida)
    //   this.ciudad_recibida = this.navParams.get("ciudad");
    // if(!this.valor)
    //   this.valor = this.navParams.get("valor");
    // if(!this.coordenadas_recibidas)
    //   this.coordenadas_recibidas = this.navParams.get("coordenadas");
    // if(!this.ciudad_recibida)
    //   this.id_ciudad_recibida = this.navParams.get("id_ciudad");

    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: this.mensajes.ubicacion,
      duration: 6000
    });
    loading.present();
    setTimeout(() => {
      this.carga_establecimientos('y ver mapa');
      this.carga_categorias();
      loading.dismiss();
      setTimeout(() => {
        this.showpromoF();
      }, 2000);
    }, 2000);
    let watch = this.geolocation.watchPosition(); 
    watch.subscribe((data) => {
      // let options = {
      //   timeout: 50000,
      //   enableHighAccuracy : false,
      // };
      
      // this.geolocation.getCurrentPosition(options).then((data) => {  

      this.latitud = data.coords.latitude;
      this.longitud = data.coords.longitude;
      let update = true;
      if(this.mi_marcador){
        // this.msg="actualizo el marcador watch";
        // this.presentToast();
        // var newLatLng = new L.LatLng(data.coords.latitude , data.coords.longitude);
        this.mi_marcador.setLatLng([data.coords.latitude , data.coords.longitude]);
        update = false;
        return;
        
      }

      var firefoxIcon = L.icon({
        iconUrl: 'assets/icon/ubicacion.png',
        iconSize: [33, 50], // size of the icon
      });

      if(data.coords && this.map && update){
        try {
          this.map.removeLayer(this.mi_marcador);
        } catch (error) {
          
        }
        this.mi_marcador = L.marker([ data.coords.latitude , data.coords.longitude ], { icon: firefoxIcon }).addTo(this.map);
      }

    });
    
  }

  showpromoF(){
    this.showPromo = true;
    setTimeout(() => {
      this.showPromo = false;
    }, 4000);
  }



  obtenerUbicacion(){

    /*
    let options = {
      timeout: 50000,
      enableHighAccuracy : false,
    };
    
    this.geolocation.getCurrentPosition(options).then((resp) => {

      console.log('GPS UBICACION --->:', resp);
      
    }).catch((error) => {
      console.log('Error getting location', error);
    });*/
  }



  
  ionViewDidLeave(){
    
    // let self = this;
    // this.l_markers.forEach(function (layer) { 
    //   self.map.removeLayer(layer);
    // });
    // this.map.remove();
    // this.markers_base = [];
    // this.l_markers = [];
    // this.markers = [];

  }

  //VALOR OBTENIDO EN EL MAPA ACTUAL
  active: boolean = false;
  ionSelected() {
    //console.log('----->');
    if (this.active) {
      //move('#buscador').y(500).end();
      this.active = false;
      this.events.publish('tabs:icon', 'icon-burger');

    } else {
      //move('#buscador').y(-500).end();
      this.active = true;
      this.events.publish('tabs:icon', 'md-arrow-down');

    }

  }
  

  //Carga

  carga_establecimientos(mapa?) {

    this.st.get('ls_establecimientos').then(resultado => {

      //console.log('TODOS ESTABLECIMIENTOS',resultado);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
      
      for (let i = 0; i < resultado.length; i++) {
        if (resultado[i]['ciudad_id'] == this.id_ciudad_recibida && resultado[i]['promocion'] == 0) {
          this.markers.push(resultado[i]);
        }
      }

      this.markers_base = this.markers;

      if (mapa) {
        this.mapa();
      }

    });
  }

  //LISTAR ESTABLECIMIENTOS PARA BUSQUEDA


  //BUSCADOR DE MAPAS
  getItems(ev: any) {    
    this.markers = this.markers_base; //Carga de datos

    let val = ev;
    if (val && val.trim() != '') {
      this.markers = this.markers.filter((item) => {  //Los dos valores se toman de la consulta a la api (nombre del array)
      return (item.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1); //Para obtener el nombre del establecimiento
      })
    }

    this.actualizar_mapa();

  }


  actualizar_mapa(){
    let self = this;
    this.l_markers.forEach(function (layer) { 
      self.map.removeLayer(layer);
    });

    if(this.mi_marcador){
      self.map.removeLayer(this.mi_marcador);
      // this.msg = "voy a borrar el marcador en actualizar_map";
      // this.presentToast();
    }
    
    this.carga_marcadores();
  }


  //MODAL DESCRIPCION CADA ESTABLECIMIENTO
  presentDescriptionModal(marker) {
    let descriptionModal = this.modalCtrl.create('DescriptionPage', { nombre: marker.nombre, descripcion: marker.descripcion, imagen: marker.logo, audio: marker.audio, ciudad:this.ciudad_recibida, latitud:marker.latitud, longitud:marker.longitud, direccion:marker.direccion, id_ciudad:this.id_ciudad_recibida, galerias: marker.galeria, email:marker.email, telefono:marker.telefono, web:marker.web, categorias_id:marker.categorias_id});
    descriptionModal.present();
    //console.log('jdfksf--_>',marker.audio, marker.latitud, marker.longitud);
  }

  

  //CATEGORIAS DE EJEMPLO 
  carga_categorias() {

    this.categorias = [];
    /**
     * filtrando categorias tipo promocion
     */
    this.st.get('ls_categorias').then((resultado) => {
      console.log('CATEGORIAS : ', resultado);

      for (let i = 0; i < resultado.length; i++) {
        if (resultado[i]['promocion'] == 0) {
          this.categorias.push(resultado[i]);

          //console.log('Categoria   ',this.categorias);
          //console.log('Icono   ',this.icono);
        }
      }
      this.categorias=this.categorias;
    });
  }

  /**
   * FILTRAR CATEGORIAS
   */
  filtrar(id) {
    this.id_categoria = id;
    this.markers = [];
    console.log('La categoria que se selecciona es ', this.id_categoria);

        for (let i = 0; i < this.markers_base.length; i++) {
          //console.log('todo',resultado[i]);
          if (this.markers_base[i]['categorias_id'] == this.id_categoria) {
            this.markers.push(this.markers_base[i]);
            //console.log('Categorias a mostrarse push ',this.markers_base[i]);
            //this.listado_establecimientos(); //Ejemplo con datos quemados
          }
        }

    this.actualizar_mapa();
    
  }


  /**
   * MAPAS OFFLINE
   */
  mapa() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: this.mensajes.mapa_offline,
      duration: 6000
    });
    loading.present();

      let container = L.DomUtil.get('map');
      if(container != null)
        (container as any)._leaflet_id = null;
      this.map = L.map('map').
        setView(this.coordenadas_recibidas,
          16);

    loading.dismiss();

    console.log('Aqui se guarda',this.storageDirectory+this.ciudad_recibida+this.ciudad_recibida);

    if(!this.isDevice){
      this.map1 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 13 }).addTo(this.map);
    }else{
      if(!this.internet){
        this.map1 = L.tileLayer( this.storageDirectory + this.ciudad_recibida + '/' + this.ciudad_recibida + '/{z}/{x}/{y}.png' , { maxZoom: 18, minZoom: 13 }).addTo(this.map);
      }else{
        this.map1 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 13 }).addTo(this.map);
      }
      
    }
    this.carga_marcadores();
  }


  async localizarme(){
    
    if(this.mi_marcador){
      if(this.mi_marcador && this.mi_marcador._latlng != undefined && this.map != undefined){
        this.map.panTo(this.mi_marcador._latlng);
        this.map.setView(this.mi_marcador._latlng);
        this.map.setZoom(16);
      }

      let options = {
        enableHighAccuracy : false
      };
      this.geolocation.getCurrentPosition(options).then((resp) => {
        this.latitud=resp.coords.latitude
        this.longitud=resp.coords.longitude
         try { 
        // this.map.removeLayer(this.mi_marcador);
        // var newLatLng = new L.LatLng(this.latitud, this.longitud);
        this.mi_marcador.setLatLng([this.latitud, this.longitud]);
        this.mi_marcador.closePopup(); 
        this.map.panTo(new L.LatLng(this.latitud , this.longitud));
        // this.msg="actualizo el marcador localizame";
        // this.presentToast();

        return
      } catch (error) {
        return
      }
      }).catch();
    }

    var firefoxIcon = L.icon({
      iconUrl: 'assets/icon/ubicacion.png',
      iconSize: [33, 50], // size of the icon
    });
  
    if(this.latitud && this.map){
      try {
        this.map.removeLayer(this.mi_marcador);
      } catch (error) {}
      this.mi_marcador = L.marker([ this.latitud , this.longitud ], { icon: firefoxIcon }).addTo(this.map);
      this.map.panTo(this.mi_marcador._latlng);
      this.map.setView(this.mi_marcador._latlng);
      this.map.setZoom(16);
    }

    try {
      const resp = await this.geolocation.getCurrentPosition();
        this.latitud=resp.coords.latitude
        this.longitud=resp.coords.longitude
        this.map.panTo(new L.LatLng(this.latitud , this.longitud));
        this.map.setView(this.mi_marcador._latlng);
        this.map.setZoom(16);
    } catch (error) {
      
    }
  
    
    setTimeout(() => {
       this.mi_marcador.closePopup(); 
    }, 2000);

  }


  
  carga_marcadores(){
    let self = this;

    this.map.locate({
        setView: this.valor ,  //Activa o desactiva geolocalización
        timeout: 1000*60,
        enableHighAccuracy: true, 
        maximumAge: 1000*60*60
    })
    .on('locationfound', (e) => {

      console.log("LEAFLET MI UBICACIÓN ------> ", e);

      var firefoxIcon = L.icon({
        iconUrl: 'assets/icon/ubicacion.png',
        iconSize: [33, 50], // size of the icon
      });

      if(this.mi_marcador){
        this.map.removeLayer(this.mi_marcador);
        // this.msg = "borro el marcador cuando voy a cargar los marcadores";
        // this.presentToast();
      }
      
      self.mi_marcador = L.marker(e.latlng, { icon: firefoxIcon }).addTo(this.map)
      .bindPopup(this.mensajes.tu_te_encuentras_aqui).openPopup();
      //L.circle(e.latlng).addTo(this.map);
      setTimeout(() => {
        self.mi_marcador.closePopup(); 
      }, 2000);

    }).on('locationerror', (err) => {
      console.log('ERROR MAPA', err);
      
      var firefoxIcon = L.icon({
        iconUrl: 'assets/icon/ubicacion.png',
        iconSize: [33, 50], // size of the icon
      });

      /*
      let options = {
        enableHighAccuracy : false
      };
      this.geolocation.getCurrentPosition(options).then((resp) => {
        this.latitud=resp.coords.latitude
        this.longitud=resp.coords.longitude
        console.log("Error en latitud y longitud", this.latitud,this.longitud);
        self.mi_marcador = L.marker([this.latitud,this.longitud], { icon: firefoxIcon }).addTo(this.map)
        .bindPopup("Tu te encuentras aquí").openPopup();
      });
      */
    });

    this.marcadores();

  }

  marcadores() {
    //this.markers = this.markers_base; //Carga de datos
    for (var i = 0; i < this.markers.length; ++i) {

      if (this.markers[i].categorias_id == 1) {
        this.setear_marcador(i,'assets/icon/icon_edif.png');
      } else if (this.markers[i].categorias_id == 3) {
        this.setear_marcador(i,'assets/icon/icon_igle.png'); 
      } else if (this.markers[i].categorias_id == 4) {
        this.setear_marcador(i,'assets/icon/icon_mus.png');  
      } else  if (this.markers[i].categorias_id == 2) {
        this.setear_marcador(i,'assets/icon/icon_plaz.png');  
      }

    }
  }


  setear_marcador(i,icono){
    var firefoxIcon = L.icon({
      iconUrl: icono,
      iconSize: [33, 50], // size of the icon
    });
    let marker =  L.marker([this.markers[i].latitud, this.markers[i].longitud], { icon: firefoxIcon })
    .bindPopup('<b>' + this.mensajes.lugar +' </b>' + this.markers[i].nombre + '</br>' + '<b>' + this.mensajes.direccion +':</b>' + this.markers[i].direccion +' </br></br> <center> <a class="link-establecimiento'+this.markers[i]['id']+'" data-establecimiento="'+ this.markers[i]['id'] +'"> '+ this.mensajes.ver_mas + ' </a> </center> ' )
    .addTo(this.map);

    let self = this;
    let id = this.markers[i]['id'];

    marker.on('popupopen', function() {
      // add event listener to newly added a.merch-link element
      self.elementRef.nativeElement.querySelector(".link-establecimiento"+id)
      .addEventListener('click', (e)=>
      {
        // get id from attribute
        var id_establecimiento = e.target.getAttribute("data-establecimiento");
        self.seleccionar_establecimiento(id_establecimiento);

      });
    });


    this.l_markers.push( marker );


  }


  seleccionar_establecimiento(id) {
    for (let i = 0; i < this.markers.length; i++) {
      if (this.markers[i]['id'] == id ) {
        this.presentDescriptionModal(this.markers[i]);
      }
    }
  }



}
