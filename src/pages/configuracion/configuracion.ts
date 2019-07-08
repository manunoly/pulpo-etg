import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Proveedor1Provider } from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import { Storage } from "@ionic/storage";
import { Zip } from '@ionic-native/zip';
import { Geolocation } from '@ionic-native/geolocation';  //Importar Google API
import { Network } from '@ionic-native/network';
import { ASSETS_URL } from "../../config";
import { TranslateService } from '@ngx-translate/core';
import { arch } from 'os';

declare var cordova: any;
declare var google;

@IonicPage()
@Component({
  selector: 'page-configuracion',
  templateUrl: 'configuracion.html',
})
export class ConfiguracionPage {
  opcion: string = "mapas";   //Inicializar segmento
  storageDirectory: string = '';
  ciudad_actual: any = '';
  location: any;
  mapas_disponibles: any = [];
  mapas_disponibles_iconos: any = [];
  mapa_descarga: string;
  ciudad_descarga: string;
  ciudades_inputs: any;
  icono_geo: string;
  ciudad_offline: string;
  disconnectSubscription: any;
  internet: boolean = false;
  loading: any;
  parametros: string;
  suma_mapas: any;
  first = true;
  listado_ciudades: any;
  archivos_descarga: any = [];
  actualizacion: any = [];
  isDevice: boolean = false;

  mensajes: any = [];
  all_mapa_seleccionado: any = [];


  archivos_no_descargados: any = [];

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public proveedor: Proveedor1Provider,
    public alertCtrl: AlertController,
    public platform: Platform,
    private file: File,
    private transfer: FileTransfer,
    private geolocation: Geolocation,
    private zip: Zip,
    private network: Network,
    private st: Storage,
    translate: TranslateService
  ) {


    //USANDO IDIAOMA SELECCIONADO
    this.st.get('ls_idioma').then(resultado => {
      if (resultado) {
        translate.use(resultado);

      } else {
        translate.use('es');
      }
    });


    let mensajes;
    translate.get('configuracion').subscribe(
      value => {
        mensajes = value;
      }
    )
    this.mensajes = mensajes;



    platform.registerBackButtonAction(() => {
      console.log("Retroceso negado");
    }, 1);

    //DIRECCION DE LA CARPETA EN DONDE SE VAN A GUARDAR LOS ARCHIVOS
    this.platform.ready().then(() => {
      // make sure this is on a device, not an emulation (e.g. chrome tools device mode)
      if (!this.platform.is('cordova')) {
        return false;
      }

      if (this.platform.is('ios')) {
        this.storageDirectory = cordova.file.documentsDirectory;
        this.isDevice = true;
      }
      else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;
        this.isDevice = true;
      }
      else {
        // exit otherwise, but you could add further types here e.g. Windows
        return false;
      }
    });




    // watch network for a connection
    this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      setTimeout(() => {
        if (this.network.type !== 'none' && this.network.type !== 'unknown') {
          console.log('Tienes conexion wifi, woohoo!');
          this.internet = true;
        }
      }, 3000);
    });


    //CONEXION ONLINE 
    // watch network for a disconnect
    this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      this.internet = false;
    });


  }


  fileTransfer: FileTransferObject = this.transfer.create();



  ionViewDidLoad() {


    this.platform.ready().then(() => {
      console.log(this.network.type);
      if (this.network.type !== 'none' && this.network.type !== 'unknown') {
        console.log('Estas conectado a internet')
        this.internet = true;
      }

      if (!this.platform.is('cordova')) {
        this.internet = true;
      }

    });


    setTimeout(() => {
      this.inicializar_elementos();
    }, 1000);
    //this.verificarexistencia(); //En desarrollo
  }


  inicializar_elementos() {

    if (this.internet) {

      this.getPosition();

      let loading = this.loadingCtrl.create({
        content: this.mensajes.actualizacion ? this.mensajes.actualizacion : '',
      });

      loading.present();

      this.proveedor.actualizaciones().then((resultado) => {
        console.log('ACTUALIZACION', resultado);
        /**
         * OBTENER EL IDIOMA SELECCIONADO
         */
        this.st.get('ls_idioma').then((idioma) => {
          console.log('IDIOMA SELECCIONADO : ', idioma);
          if (resultado) {
            //existe actualizacion
            this.actualizacion = resultado;
            this.parametros = '?idioma=' + idioma;
            this.obtener_ciudades(this.parametros);

          } else {
            this.local_ciudades();
          }
        });

        loading.dismiss();

      }, (err) => {
        loading.dismiss();
        console.log(err);
      });

      this.proveedor.notificacion();

    } else {

      this.ciudad_actual = '';
      this.local_ciudades();
    }

  }



  /******************* SIN INTERNET Y SIN ACTUALIZACIONES **************************/
  local_ciudades() {
    this.st.get('ls_ciudades').then((ciudades) => {
      console.log('LOCAL CIUDADES : ', ciudades);
      if (ciudades) {
        this.listado_ciudades = ciudades;
        this.obtener_mapas();
      } else {
        console.log('ERROR OFFLINE CIUDADES');
        //this.ionViewDidLoad();
      }
    });
  }


  /******************* CON INTERNET **************************/
  imagen: string;

  /**
   * 1. OBTENER CIUDADES PARA EL LISTADO DE DESCARGA
   */
  obtener_ciudades(idioma?) {

    this.loading = this.loadingCtrl.create({
      content: this.mensajes.ciudades,
    });
    this.loading.present();

    this.parametros = idioma;


    this.proveedor.obtener_ciudades(this.parametros, this.internet).then((resultado) => {

      console.log('CIUDADES OK', resultado);
      this.listado_ciudades = resultado;
      this.obtener_categorias();
      this.obtener_mapas();


    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }


  /**
   * 2. Obtener todas las categorias
   */
  obtener_categorias() {

    console.log(this.parametros);

    this.proveedor.obtener_categorias(this.parametros, this.internet).then((resultado) => {
      console.log('CATEGORIAS OK', resultado);
      this.obtener_establecimientos();
    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }


  /**
   * 3. Obtener todos los establecimientos  
   * 
   */
  obtener_establecimientos() {
    this.proveedor.obtener_establecimientos(this.parametros, this.internet).then((resultado) => {
      console.log('ESTABLECIMIENTOS OK', resultado);
      this.obtener_promociones();
    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }


  /**
   * 4. Obtener todos los establecimientos  
   * 
   */
  obtener_promociones() {
    this.proveedor.obtener_promociones(this.parametros, this.internet).then((resultado) => {
      console.log('PROMOCIONES OK', resultado);
      this.loading.dismiss();

      this.descargar_archivos();

    }, (err) => {
      this.loading.dismiss();
      console.log(err);
    });
  }



  format_ur(string_url) {
    let url;
    try {
      url = string_url.replace(/\\/g, "/");
    }
    catch (err) {
      url = string_url;
    }

    return url;
  }


  x = 0;


  /**
   * 
   * @param 
   * @param 
   */
  descargar_archivos() {
    //categorias
    this.loading = this.loadingCtrl.create({
      content: this.mensajes.contenido,
    });
    this.loading.present();


    this.obtener_imagenes_ls('ls_categorias', 'icono');
    this.obtener_imagenes_ls('ls_establecimientos', 'logo');
    this.obtener_imagenes_ls('ls_establecimientos', 'galeria', 'galeria');
    this.obtener_imagenes_ls('ls_promociones', 'imagen');
    this.obtener_imagenes_ls('ls_promociones', 'galeria', 'galeria_promo');
    this.obtener_imagenes_ls('ls_establecimientos', 'audio', 'audio');

    setTimeout(() => {
      this.loading.dismiss();
    }, 4000);
  }

  modelPromises = [];

  obtener_imagenes_ls(ls, item_url, tipo?) {

    this.platform.ready().then(() => {

      this.st.get(ls).then((resultado) => {
        for (let i = 0; i < resultado.length; i++) {
          //console.log(resultado[i][item_url])
          if (resultado[i][item_url]) {

            let ciudad = resultado[i]['ciudad'] ? resultado[i]['ciudad_id'] : null;

            if (tipo) {
              if (tipo == 'audio') {
                let info_archivo = JSON.parse(resultado[i][item_url]);
                this.archivos_descarga.push({ link: this.format_ur(info_archivo[0]['download_link']), city: ciudad });

              } else if (tipo == 'galeria') {
                if (resultado[i][item_url].length > 0) {
                  for (let g = 0; g < resultado[i][item_url].length; g++) {
                    this.archivos_descarga.push({ link: this.format_ur(resultado[i][item_url][g]['imagen']), city: ciudad });
                  }
                }
              } else if (tipo == 'galeria_promo') {
                let urls = JSON.parse(resultado[i][item_url]);
                for (let g = 0; g < urls.length; g++) {
                  this.archivos_descarga.push({ link: this.format_ur(urls[g]), city: ciudad });
                }
              }

            } else {
              this.archivos_descarga.push({ link: this.format_ur(resultado[i][item_url]), city: ciudad });
            }

          }

        }

      });

    });
  }


  ciudadDescarga() { 

    //SI NO SE ESTA USANDO DISPOSITIVO MOVIL
    // if(!this.isDevice) {
    //   this.ir_mapa();
    //   return;
    // }



    //VERIFICANDO SI SE SELECCIONA LA CIUDAD
    // if (this.ciudad_offline === undefined) {
    //   let alert = this.alertCtrl.create({
    //     title: this.mensajes.titulo_atencion,
    //     message: this.mensajes.ubicacion_disponible,
    //     buttons: [
    //       {
    //         text: this.mensajes.continuar,
    //         role: this.mensajes.cancelar,
    //         handler: () => {

    //         }
    //       }
    //     ]
    //   });
    //   alert.present();
    //   return;
    // }


    //VERIFICANDO SI YA SE DESCARGO LOS ARCHIVOS
      /**
       * IR AL MAPA CUANDO NO HAY DESCARGAS;
       */    
    // if (this.archivos_descarga.length == 0) {
    //   console.log("HAY DESCARGAS :", this.archivos_descarga);
    //   this.ir_mapa();
    //   return;
    // }



    /**
     * Verificando si se ha descargado el mapa
     */
    this.file.checkDir(this.storageDirectory, this.ciudad_offline).then(_ => {
      if (this.archivos_descarga.length == 0) {
        console.log("No HAY DESCARGAS, ir al mapa", this.archivos_descarga);
        this.ir_mapa(); 
        return;       
      }
      this.loading = this.loadingCtrl.create({
        content: this.mensajes.descargando,
      });
      this.loading.present();

      this.descargandoArchivos();

    })
      .catch(err => {

        /**
         * Si el mapa aun no se ha descargado
         */

        console.log(this.all_mapa_seleccionado);
        if (!this.all_mapa_seleccionado) {
          console.log("Error mapa seleccionado");
          return;
        }

        const confirm = this.alertCtrl.create({
          title: this.mensajes.titulo_atencion,
          message: this.mensajes.sin_mapa_descarga,
          buttons: [
            {
              text: this.mensajes.continuarDescarga,
              handler: () => {
                console.log('Disagree clicked');
                this.btndescarga(this.all_mapa_seleccionado);
              }
            },
            {
              text: this.mensajes.continuarSinDescarga,
              handler: () => {
                this.ir_mapa();
              }
            }
          ]
        });
        confirm.present();

      });


    /*
    this.file.checkDir(this.storageDirectory, this.ciudad_offline)
    .then(() => {

    }, (err) => {
      
    });
    */
  }



  async descargandoArchivos() {
    console.log('esto tiene la descarga de los archivos, descargandoArchivos', this.archivos_descarga)
    if (this.archivos_descarga.length == 0)
      return;
    let loading = this.loadingCtrl.create({
      content: this.mensajes.descargando,
    });
    loading.present();

    /**
     * Recorriendo archivos para la descarga
     */

    let i;
    for (i = 0; i < this.archivos_descarga.length; i++) {

      if (!this.archivos_descarga[i]['city']) {
        try {
          await this.descargador(this.archivos_descarga[i]['link']).then((resultado) => {

            if (resultado) {
              console.log('1) Descarga de imagenes terminada ');
            }

          }, (err) => {
            console.log('1) Descarga temrinada con error');
            this.archivos_no_descargados.push(err);
            this.st.set('ls_archivos_error', this.archivos_no_descargados);
          });
        } catch (error) {
          console.log('error 532 catch', error)
          loading.dismissAll();
          this.ir_mapa();
        }
      } else {

        /**
         * Descargar imagenes solo de la ciudad seleccionada
         */
        if (parseInt(this.archivos_descarga[i]['city']) == this.id_ciudad) {
          try {
            await this.descargador(this.archivos_descarga[i]['link']).then((resultado) => {

              if (resultado) {
                console.log('2) Descarga de imagenes terminada ');
              }

            }, (err) => {

              console.log('3) Descarga de imagenes terminada con error');
              this.archivos_no_descargados.push(err);
              this.st.set('ls_archivos_error', this.archivos_no_descargados);

            });

          } catch (error) {
            console.log('error 558 catch', error)
            loading.dismissAll();
            this.ir_mapa();

          }
        }


      }


      console.log("----->>>>>", i + 1, this.archivos_descarga.length);
      if (i + 1 == this.archivos_descarga.length) {
        console.log('4) DESCARGA IMAGENES TERMINADA');
        loading.dismissAll();
        this.ir_mapa();
      }

      //end for
    }

  }

  obtener_nombre_archivo(url) {
    var filename = url.substring(url.lastIndexOf('/') + 1);
    return filename;
  }

  descargador(url) {

    return new Promise((resolve, errores) => {


      let path = this.storageDirectory + url;
      let nombre = this.obtener_nombre_archivo(path);
      path = path.replace(nombre, '');

      this.file.checkFile(path, nombre)
        .then(() => {
          console.log('Ya exite el archivo', path, nombre);
          resolve(true);

        }, (err) => {
          //console.log(err);
          let url_server = ASSETS_URL + url;

/*        este codigo saltaba los MP3 para descargarlos   
          if (url.includes('.mp3')) {
            console.log('esta url incluye el mp3, la salto', url);
            resolve(true);
            return;
          } */

          this.fileTransfer.download(url_server, this.storageDirectory + url).then((entry) => {
            console.log('Descarga completa  : ' + entry.toURL());
            this.imagen = entry.toURL();
            resolve(true);

          }, (error) => {
            console.log('ERROR', error);
            errores(url_server);
            //resolve(true);
          });

        });

    });

  }













  //PARA DESCARGAR LOS MAPAS DESDE EL GEOLOCALIZADOR
  btndescargageo(archivo) {

    let result_existe_ciudad = this.verificar_ciudad(archivo);
    if (!result_existe_ciudad) {
      let alert = this.alertCtrl.create({
        title: this.mensajes.titulo_atencion,
        message: this.mensajes.no_ciudad,
        buttons: [
          {
            text: this.mensajes.aceptar,
            role: this.mensajes.cancelar,
            handler: () => {
            }
          }
        ]
      });
      alert.present();
      return;

    } else {
      this.mapa_descarga = result_existe_ciudad['archivo'];
      let array_ciudad = this.mapa_descarga.split('.');
      this.ciudad_descarga = array_ciudad[0];
    }

    this.file.checkDir(this.storageDirectory, this.ciudad_descarga.toLowerCase())
      .then(() => {

        let alert = this.alertCtrl.create({
          title: this.mensajes.titulo_atencion,
          message: this.mensajes.existe_mapa,
          buttons: [
            {
              text: this.mensajes.aceptar,
              role: this.mensajes.cancelar,
              handler: () => {
                //this.icono_geo='checkmark';
              }
            }
          ]
        });
        alert.present();

      }, (err) => {

        console.log(err);
        /*
        if (!this.verificar_ciudad(this.ciudad_actual)) {
          let alert = this.alertCtrl.create({
            title: this.mensajes.titulo_atencion,
            message: 'No existe el mapa, por favor selecciona otro',
            buttons: [
              {
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          alert.present();
        } else {
          this.confirmacion();
        }*/

      });
  }

  async checkExist(archivo) {
    let nombre_archivo = JSON.parse(archivo['archivo']);

    this.mapa_descarga = nombre_archivo;

    nombre_archivo = nombre_archivo[0]['original_name'];

    this.ciudad_descarga = nombre_archivo.split('.');
    this.ciudad_descarga = (this.ciudad_descarga[0]).toLowerCase();
    try {
      return await this.file.checkDir(this.storageDirectory, this.ciudad_descarga);
    } catch (error) {
      return false;
    }
  }

  //PARA DESCARGAR LOS MAPAS DESDE EL GRID VIEW
  btndescarga(archivo, check = true) {
    if (!check) {
      return;
    }
    let nombre_archivo = JSON.parse(archivo['archivo']);

    this.mapa_descarga = nombre_archivo;

    nombre_archivo = nombre_archivo[0]['original_name'];


    this.ciudad_descarga = nombre_archivo.split('.');
    this.ciudad_descarga = (this.ciudad_descarga[0]).toLowerCase();


    console.log(this.storageDirectory, this.ciudad_descarga);

    this.file.checkDir(this.storageDirectory, this.ciudad_descarga)
      .then(() => {

        let alert = this.alertCtrl.create({
          title: this.mensajes.titulo_atencion,
          message: this.mensajes.existe_mapa,
          buttons: [
            {
              text: this.mensajes.aceptar,
              role: this.mensajes.cancelar,
              handler: () => {
              }
            }
          ]
        });
        alert.present();

      }, (err) => {

        console.log(err);
        this.confirmacion();
        /*
        if (!this.verificar_ciudad(this.ciudad_actual)) {
          let alert = this.alertCtrl.create({
            title: this.mensajes.titulo_atencion,
            message: 'No existe el mapa, por favor selecciona otro',
            buttons: [
              {
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          alert.present();
        } else {
          this.confirmacion();
        }*/

      });
  }


  //Código para dar la autorización de descargarse los mapas offline
  confirmacion() {
    let confirm = this.alertCtrl.create({
      title: this.mensajes.titulo_atencion,
      message: this.mensajes.descargar_mapa,
      buttons: [
        {
          text: this.mensajes.cancelar,
          handler: () => {
          }
        },
        {
          text: this.mensajes.aceptar,
          handler: () => {
            this.descargarmapa();
          }
        }
      ]
    });
    confirm.present();
  }


  progreso
  //DESCARGA DE MAPAS
  descargarmapa() {
    console.log('AQUI SE GUARDA TELEFONO', this.storageDirectory + this.ciudad_descarga);
    //Código para descargarse el mapa

    //const url = ASSETS_URL;
    console.log('De aqui se descarga', ASSETS_URL)
    const url = ASSETS_URL + this.mapa_descarga[0]['download_link'];
    //let fileTransfer: FileTransferObject = this.transfer.create();

    console.log();

    let loader = this.loadingCtrl.create({
      content: this.mensajes.descargando_mapa,
    });

    loader.present();

    this.platform.ready().then(() => {

      this.fileTransfer.download(url, this.storageDirectory + this.mapa_descarga[0]['original_name']).then((entry) => {
        console.log('Descarga completa  : ' + entry.toURL());
        //this.fileTransfer.onProgress((progress) =>  console.log(progress) );
        this.imagen = entry.toURL();
        loader.dismiss();

        setTimeout(() => {     //Descompresion despues de la descarga
          this.descomprimir();
        }, 1000);

      }, (error) => {
        // handle error
        console.log('ERROR descargando', error);
        loader.dismiss();
      });
    });
  }

  //UNZIP
  descomprimir() {
    let loader = this.loadingCtrl.create({
      content: this.mensajes.descomprimir,
    });
    loader.present();

    console.log('AQUI SE GUARDA', this.storageDirectory + this.ciudad_descarga);
    if (this.archivos_descarga.length == 0)
      this.descargar_archivos();

    this.zip.unzip(this.storageDirectory + this.mapa_descarga[0]['original_name'], this.storageDirectory + this.ciudad_descarga, (progress) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%'))
      .then((result) => {
        console.log(result);
        loader.dismiss();
        if (result === 0) {
          this.obtener_mapas();
          this.descargandoArchivos();

        }
        if (result === -1) console.log('FALLO descromprimiendo this.zip.unzip');
      }).catch();
  }


  //EJEMPLO CON DATOS OFFLINE
  obtener_mapas() {

    this.mapas_disponibles = this.listado_ciudades;
    console.log("this.mapas_disponibles", this.mapas_disponibles);

    var nuevo_array = [];

    //VERIFICAR LA EXISTENCIA DEL ARCHIVO
    let iconos_array = [];
    iconos_array = this.mapas_disponibles;


    this.suma_mapas = 0;

    for (let i = 0; i < this.mapas_disponibles.length; i++) {

      if (this.mapas_disponibles[i]['archivo']) {

        let info_archivo = JSON.parse(this.mapas_disponibles[i]['archivo']);
        //GENERAR INPUTS PARA SELECCIONAR LA CUIDAD
        let nuevo_ = {
          type: 'radio',
          id: this.mapas_disponibles[i]['id'],
          name: info_archivo[0]['original_name'],
          'label': this.mapas_disponibles[i]['nombre'],
          value: info_archivo[0]['original_name'],
          'checked': false
        }
        nuevo_array.push(nuevo_);


        let nombre = (info_archivo[0]['original_name']).split('.');
        nombre = (nombre[0]).toLowerCase();


        this.verificarArchivo(nombre).then((result) => {
          //console.log('EXISTE ?', result );
          if (result) {
            iconos_array[i]['icono'] = 'checkmark';
            this.suma_mapas += parseInt(this.mapas_disponibles[i]['peso']);
            // this.st.set('localData',true);
          } else {
            iconos_array[i]['icono'] = 'download';
          }
        }).catch();

      }

    }

    this.suma_mapas = this.suma_mapas;
    console.log("SUMA MAPAS", this.suma_mapas);

    //NUEVOS INPUTS PARA EL SELECT
    this.ciudades_inputs = nuevo_array;

    this.mapas_disponibles_iconos = iconos_array;
    //console.log(iconos_array);
  }

  //VERIFICAR SI EXISTE UN MAPA GUARDADO EN EL TELEFONO
  verificarArchivo(nombre) {

    console.log('BUSCAR DIRECTORIO', nombre);
    return new Promise((resultado, fallo) => {
      this.file.checkDir(this.storageDirectory, nombre)
        .then(() => {
          console.log('Si existe archivo : ', nombre);
          resultado(true);
        }, (err) => {
          console.log('No existe archivo : ', nombre);
          resultado(false);
        }).catch(_=>resultado(false));
    });
  }



  //BUSCADOR DE MAPAS
  getItems(ev: any) {
    this.obtener_mapas(); //Ejemplo con datos quemados

    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.mapas_disponibles = this.mapas_disponibles.filter((item) => {  //Los dos valores se toman de la consulta a la api (nombre del array)
        return (item.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1); //Para obtener la ciudad
      })
    }
  }


  //UBICACION ACTUAL DEL TELEFONO
  getPosition(): any {

    let options = {
      timeout: 30000,
      enableHighAccuracy: false,
    };

    this.geolocation.getCurrentPosition(options)
      .then(response => {
        console.log('Mi ubicacion actual coordenadas: ', response);
        this.codeLatLng(response);
      })
      .catch(error => {
        console.log(error);
      })

  }


  codeLatLng(position) {

    this.obtener_ciudad_actual(position).then((result) => {
      this.ciudad_actual = result;

      this.file.checkDir(this.storageDirectory, this.ciudad_actual.toLowerCase())
        .then(() => {
          console.log('La direccion encontrada: ' + this.ciudad_actual.toLowerCase());
          this.icono_geo = "checkmark";
        }, (err) => {
          this.icono_geo = "download";
        });

    }, (err) => {

    });
  }


  obtener_ciudad_actual(position) {

    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    let geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lng);

    return new Promise((resultado, fallo) => {

      geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

          if (results[1]) {
            //formatted address
            for (var i = 0; i < results[0].address_components.length; i++) {
              for (var b = 0; b < results[0].address_components[i].types.length; b++) {

                //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                if (results[0].address_components[i].types[b] == "locality") {
                  //this is the object you are looking for
                  this.city = results[0].address_components[i];
                  break;
                }
              }
            }
            //console.log(this.city.short_name);
            resultado(this.city.short_name.toUpperCase()); //Ubicacion actual 
          } else {
            alert("No se encontro la ubicacion");
            fallo(0);
          }
        } else {
          alert("El geolocalizador no te ha localizado: " + status);
        }

      });

    });
  }

  //BOTON CAMBIAR LA UBICACION
  alertciudades() {

    let myAlert = this.alertCtrl.create({
      title: 'Ciudades',
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {

          },
          role: 'cancel'
        },
        {
          text: 'Seleccionar',
          handler: data => {
            this.ciudad_descarga = data;
          },
          role: ''
        }
      ],
      inputs: this.ciudades_inputs
    });
    myAlert.present();

  }

  //VERIFICAR SI EXISTE LA CIUDAD EN JSON

  verificar_ciudad(ciudad_nombre) {

    let nombre = ciudad_nombre.toLowerCase();
    //console.log('No me funciona :(',nombre);
    let isEqual = false;

    this.mapas_disponibles.forEach(function (value, index) {

      let ciudad = (value.ciudad).toLowerCase();

      if (nombre == ciudad) {
        isEqual = value;
      }
    });

    return isEqual;
  }


  /**
   * SELECCIONAR UN MAPA
   */
  id_ciudad: any;
  ciudad_usar: string;
  coordenadas: any;
  ciudad_seleccionada(mapa) {
    this.first = false;
    this.all_mapa_seleccionado = mapa;
    let info_archivo = JSON.parse(mapa['archivo']);

    this.id_ciudad = mapa.id;
    this.ciudad_usar = mapa.nombre;
    this.coordenadas = [mapa.latitud, mapa.longitud];
    this.ciudad_offline = (info_archivo[0]['original_name']).split('.');
    this.ciudad_offline = (this.ciudad_offline[0]).toLowerCase();
    console.log("Este se selecciona: " + this.ciudad_offline); //Parametro a enviar a la otra pagina
    console.log("Este se selecciona: " + this.coordenadas); //Parametro a enviar a la otra pagina
    console.log("Este se selecciona: " + this.id_ciudad); //Parametro a enviar a la otra pagina

    this.st.set('ls_ciudad_actual', this.ciudad_offline);
  }





  ir_mapa() {

    console.log('Parametros que se envian: ', this.ciudad_offline, this.coordenadas, this.id_ciudad);

    // if(!this.isDevice) { 
    this.navCtrl.setRoot('TabsPage', { ciudad: this.ciudad_offline, valor: true, coordenadas: this.coordenadas, id_ciudad: this.id_ciudad });
    // return;
    // }

    // this.file.checkDir(this.storageDirectory, this.ciudad_offline)
    // .then(() => { 
    //   if (this.ciudad_offline) {
    //     this.navCtrl.setRoot('TabsPage', { ciudad: this.ciudad_offline, valor: true, coordenadas: this.coordenadas, id_ciudad: this.id_ciudad });
    //   } else {
    //     this.navCtrl.setRoot('TabsPage', { ciudad: this.ciudad_offline, valor: true, coordenadas: this.coordenadas, id_ciudad: this.id_ciudad });
    //   // esto estaba para no navegar this.navCtrl.setRoot('TabsPage', { ciudad: this.ciudad_offline, valor: false, coordenadas: this.coordenadas, id_ciudad: this.id_ciudad  });
    //   }
    // }, (err) => {


    // });


  }

  //ELIMINAR UN MAPA 

  eliminarmapa(mapa) {

    let ciudad = JSON.parse(mapa['archivo']);
    ciudad = ciudad[0]['original_name']

    this.ciudad_descarga = ciudad.split('.');
    this.ciudad_descarga = this.ciudad_descarga[0];
    console.log('esta es  la ciudad ---->', this.ciudad_descarga);
    let loader = this.loadingCtrl.create({
      content: this.mensajes.eliminar,
    });

    this.file.checkDir(this.storageDirectory, this.ciudad_descarga.toLowerCase())
      .then(() => {
        let alert = this.alertCtrl.create({
          title: this.mensajes.titulo_atencion,
          message: this.mensajes.confirmar_eliminar,
          buttons: [
            {
              text: this.mensajes.cancelar,
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text: this.mensajes.continuar,
              handler: () => {

                loader.present();

                console.log('dfcds ' + this.ciudad_descarga.toLowerCase());
                this.file.removeRecursively(this.storageDirectory, this.ciudad_descarga.toLowerCase())
                  .then(entry => {

                    let alert = this.alertCtrl.create({
                      title: this.mensajes.titulo_atencion,
                      message: this.mensajes.eliminar_ok,
                      buttons: [
                        {
                          text: this.mensajes.continuar,
                          role: this.mensajes.cancelar,
                          handler: () => {
                            loader.dismiss();
                          }
                        }
                      ]
                    });
                    alert.present();
                    this.obtener_mapas();

                  }).catch(err => {
                    let alert = this.alertCtrl.create({
                      title: this.mensajes.titulo_atencion,
                      message: this.mensajes.eliminar_error,
                      buttons: [
                        {
                          text: this.mensajes.continuar,
                          role: this.mensajes.cancelar,
                          handler: () => {
                            loader.dismiss();
                          }
                        }
                      ]
                    });
                    alert.present();
                  });
              }
            }
          ]
        });
        alert.present();
      }, (err) => {
        let alert = this.alertCtrl.create({
          title: this.mensajes.titulo_atencion,
          message: this.mensajes.sin_mapa,
          buttons: [
            {
              text: this.mensajes.continuar,
              role: this.mensajes.cancelar,
              handler: () => {
              }
            }
          ]
        });
        alert.present();
      });
  }
}
