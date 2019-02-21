import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform,normalizeURL,LoadingController,Content } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { File } from '@ionic-native/file'; 
import { ASSETS_URL } from "../../config";
import { Proveedor1Provider } from '../../providers/proveedor1/proveedor1'; //Obtenemos el archivo de conexion
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
@IonicPage()
@Component({
  selector: 'page-promotions',
  templateUrl: 'promotions.html',
})
export class PromotionsPage {

  @ViewChild('categoriasScroll') categoriasScroll: Content;

  categorias: any = [];
  promociones: any = [];
  promociones_base:any =[];
  storageDirectory: string;
  estabuscando:boolean = false;
  store_id:number;
  cargando:any;
  mensajes: any = [];
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private st: Storage,
    private file: File,
    public platform: Platform,
    public proveedor: Proveedor1Provider,
    public loadingCtrl: LoadingController,
    private network: Network,
    translate: TranslateService
  ) {

    let mensajes;
    translate.get('promotion_detail').subscribe(
      value => {
        mensajes = value;
      }
    )
    this.mensajes = mensajes;
    
    this.platform.ready().then(() => {
      
      if (!this.platform.is('cordova')) {
        this.storageDirectory = ASSETS_URL+'';
        console.log('local-app',this.storageDirectory);
        return;
      }
      if (this.platform.is('ios')) {
        this.storageDirectory = normalizeURL(this.file.documentsDirectory);

      }else if (this.platform.is('android')) {
        this.storageDirectory = this.file.dataDirectory;

      }

    });


    this.network.onConnect().subscribe(() => {
      console.log('Conexion activada sicronizando!');
      this.sincronizar_escaneos();
    });


    this.platform.ready().then(() => {
      console.log(this.network.type);
      if ( this.network.type !== 'none' && this.network.type !== 'unknown' ) {
        console.log('Estas conectado a internet sincronizar');
        this.sincronizar_escaneos();
      }

      if (!this.platform.is('cordova')) {
        this.sincronizar_escaneos();
      }

    });

  }


  scrollToRight() {
    var categorias = document.getElementById('categoriasScroll');
    var sLeft = categorias.scrollLeft;
    categorias.scrollLeft = sLeft + 50;
    console.log( sLeft );
  }


  scrollToLeft(){
    var categorias = document.getElementById('categoriasScroll');
    var sLeft = categorias.scrollLeft;
    if(sLeft > 0){
      categorias.scrollLeft = sLeft - 50;
    }
    console.log( sLeft );
  }



  getItems(ev: any) {
    this.promociones = [];

      this.promociones = this.promociones_base;

      const val = ev.target.value;
      if (val && val.trim() != '') {
        this.promociones = this.promociones.filter((item) => {
          return (item.titulo.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.establecimiento.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.direccion.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }

      this.estabuscando = true;
  }



  sincronizar_escaneos(){

    let loading = this.loadingCtrl.create({
      content: this.mensajes.sincronizando,
    });
    loading.present();

    this.st.get('ls_promociones_escaneadas').then((listado_promociones) => { 
      if(listado_promociones){
        let form = {
          data :  JSON.stringify(listado_promociones)
        }
        
        this.proveedor.sincronizar(form).then((resultado) => {
          console.log('sincronizado terminado', resultado);
          loading.dismiss();

        }, (err) => {
          console.log(err);
          loading.dismiss();

        });
      }else{
        loading.dismiss();
      }
    });

  }



  ionViewDidEnter() {

    this.categorias = [];
    /**
     * filtrando categorias tipo promocion
     */
    this.st.get('ls_categorias').then( (resultado) => {
      console.log('CATEGORIAS : ',resultado);

      for(let i = 0; i < resultado.length ; i++){
        if(resultado[i]['promocion'] == 1){
          this.categorias.push(resultado[i]);
        }
      }
      console.log(this.categorias);
    });


    /**
     * Obtener promociones
     */
    this.store_id = this.navParams.get("store_id");
    console.log('id del establecimiento cuando haya notificacion.', this.store_id );
    this.obtener_promociones();
    
  }


  obtener_promociones(){
    this.st.get('ls_promociones').then( (resultado) => {
      console.log('PROMOCIONESxx : ',resultado);
      this.promociones_base = resultado;
      this.promociones = this.promociones_base;
    });

    if(this.store_id){
      console.log('filtrando');
      this.st.get('ls_notification_promo').then( (notificacion) => {

        this.cargando = this.loadingCtrl.create({
          content: "Buscando ...",
        });
        this.cargando.present();
        if(notificacion){
          setTimeout(() => {
            this.filtrar( undefined,this.store_id);
          }, 2000);
        }else{
          this.cargando.dismiss();
        }
      });
    }

  }


  filtrar(categoria, store_id?){
    this.promociones = [];

    for(let i = 0; i < this.promociones_base.length ; i++){

      if( categoria ){
        console.log('sin notificacion');
        if(this.promociones_base[i]['categoria_id'] == categoria.id ){
          this.promociones.push(this.promociones_base[i]);
        }

      }else{
        console.log('con notificacion');
        if(this.promociones_base[i]['establecimientos_id'] == store_id ){
          this.promociones.push(this.promociones_base[i]);
        }
        this.st.remove('ls_notification_promo');
        this.cargando.dismiss();
      }
      
    }

    console.log( categoria,this.promociones);
  }


  detalle(promocion){
    console.log(promocion);

    this.st.set('ls_detalle_promo', promocion).then(val => {
      this.navCtrl.push('PromotionDetailPage', { promo : promocion});
		});

  }


  clase_x_tipo(value){

    let id = value.toString();
    switch (id) {
      case '5': return "restaurantes";
      case '6': return "discotecas";
      case '7': return "bares";
      default: return "discotecas";
    }
  }

}
