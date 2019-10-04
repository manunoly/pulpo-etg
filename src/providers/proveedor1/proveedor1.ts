import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {ReplaySubject} from "rxjs";
import {Storage} from "@ionic/storage";
import {JwtHelper, AuthHttp} from "angular2-jwt";
import {SERVER_URL} from "../../config";
import { AlertController } from 'ionic-angular';


@Injectable()
export class Proveedor1Provider {
  authUser = new ReplaySubject<any>(1);
  public token: any;
  idioma:string;
  
  constructor(
    public http: Http,
    private readonly storage: Storage,
    public alertCtrl: AlertController,
    private readonly jwtHelper: JwtHelper,
    private readonly authHttp: AuthHttp,
  ) {

  }

  obtenerdatos(){
    return this.http.get(`${SERVER_URL}/establecimientos`);  //WS a mostrarse
  }


  login(credentials){

    return new Promise((resolve, errores) => {
 
        this.http.post(`${SERVER_URL}/login`, credentials)
          .subscribe(res => {
            
            let data = res.json();
            this.storage.set('jwt', data.token );
            console.log('data del usuario luego de hacer login', data);
            this.storage.set('data-user',data.user);
            resolve(data);

          }, (err) => {

            if(err['_body']){
              errores(err.json());
            }else{
              //errores(err);
              this.error_conexion();
            }
         
          });
 
    });

  }

  error_conexion(){
    let alert = this.alertCtrl.create({
      title: 'Atención',
      subTitle: 'Error de conexión con el servidor.',
      buttons: [
        {
          text: 'Continuar',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }


  checkLogin() {
    
    this.storage.get('jwt').then(jwt => {

      if (jwt && !this.jwtHelper.isTokenExpired(jwt)) {

        this.authHttp.get(`${SERVER_URL}/login`)
          .subscribe(res => { 

            let data = res.json();

            if(data.success){
              console.log('token exist');
              this.authUser.next(jwt);
            }
              
          },
          (err) =>{

            console.log('jwt error', err);
            if(err['_body']){
              let json_error = err.json();

              console.log('error json', json_error);
              if(!json_error.error ){
                this.authUser.next(jwt);
                return;
              }

              if(json_error.error == 'token_invalid'){
                this.storage.remove('jwt').then(() => this.authUser.next(null)).then(() => console.log("salio"));
              }else{
                this.authUser.next(jwt);
             }
          }

        });
        // OR
        // this.authUser.next(jwt);
      }else {
        this.storage.remove('jwt').then(() => this.authUser.next(null));
        console.log('logout');
      }

    });

  }


  //Para realizar el logout
  logout() {
    this.storage.remove('jwt').then(() => this.authUser.next(null));
  }


  //OBTENER ACTUALIZACIONES
  actualizaciones(){
    
    return new Promise((resolve, errores) => {

      this.storage.get('ls_actualizaciones').then((version) => { 

        this.authHttp.get(`${SERVER_URL}/actualizaciones`)
        .subscribe(resultado => {
          let data = resultado.json();
          console.log('ACTUALIZACION:',data);
          
          if(!version){

            let primera_instalacion = [];
            primera_instalacion = data;
            primera_instalacion['imagenes'] = 1;
            primera_instalacion['audio'] = 1;

            this.storage.set('ls_actualizaciones',primera_instalacion);
            resolve(primera_instalacion);
          }else{

            if(version.id == data.id ){
              resolve(false);
            }else{
              this.storage.set('ls_actualizaciones',data);
              resolve(data);
            }
            
          }

        }, (err) => {
          if(err['_body']){
            errores(err.json());
          }else{
            this.error_conexion();
          }
        });

      });
    });
  }

  notificacion(){
 
    return new Promise((resolve, reject) => {
 
        this.http.get(`${SERVER_URL}/notificaciones`)
          .subscribe(res => {

            let n = res.json();
 
            console.log('OBTENIENDO CONF NOTIFICACION',n[0]);
            if(n[0]){
              this.storage.set('ls_notificacion',n[0]);
            }
            
            resolve(res);
 
          }, (err) => {
            
            let alert = this.alertCtrl.create({
              title: '<b>Atención</br></b>',
              subTitle: 'Error de conexión con el servidor.',
              buttons: ['OK']
                 });
            alert.present();
          });
    });
 
  }


  //REGISTRO
  signup(details){
 
    return new Promise((resolve, reject) => {
 
        this.http.post(`${SERVER_URL}/register`, details)
          .subscribe(res => {
 
           console.log('CORRECTO');
            resolve(res);
 
          }, (err) => {
            
            let alert = this.alertCtrl.create({
              title: '<b>Atención</br></b>',
              subTitle: 'Error de conexión con el servidor.',
              buttons: ['OK']
                 });
            alert.present();
          });
 
    });
 
  }

  //RESET PASSWORD 
  resetPassword(email){
   console.log('valor que viene-->',email);
    return new Promise((resolve, errores) => {
 
      this.http.post(`${SERVER_URL}/reset`, email)
        .subscribe(res => {
          resolve(res);
          console.log('respuesta del servidor ',res);
        }, (err) => {

          if(err['_body']){
            errores(err.json());
          }else{
            this.error_conexion();
          }
          
        });
    });
  }


  /**
   * ESTABLECIMIENTOS
   * @param parametros parametros para enviar que idioma se consumira del backend
   * @param clear Si se borra o no el cache en caso de que haya o no internet
   */
  obtener_establecimientos(parametros,clear?){
        
    if(clear){
      this.storage.set('ls_establecimientos',undefined);
    }
    
    return new Promise((resolve, errores) => {

      this.storage.get('ls_establecimientos').then((ls_respuesta) => { 

        if(!ls_respuesta){
          this.authHttp.get(`${SERVER_URL}/establecimientos`+parametros)
          .subscribe(resultado => {
            let data = resultado.json();
            this.storage.set('ls_establecimientos',data);
            resolve(data);
          }, (err) => {
            if(err['_body']){
              errores(err.json());
            }else{
              this.error_conexion();
            }
          });
        }else{
          resolve(ls_respuesta);
        }

      });
    });

  }



  /**
   * CIUDADES
   * @param parametros parametros para enviar que idioma se consumira del backend
   * @param clear Si se borra o no el cache en caso de que haya o no internet
   */
  obtener_ciudades(parametros,clear?){

    if(clear){
      this.storage.set('ls_ciudades',undefined);
    }
    
    return new Promise((resolve, errores) => {

      this.storage.get('ls_ciudades').then((ls_respuesta) => { 

        if(!ls_respuesta){
          this.authHttp.get(`${SERVER_URL}/ciudades`+parametros)
          .subscribe(resultado => {
            let data = resultado.json();
            this.storage.set('ls_ciudades',data);
            resolve(data);
          }, (err) => {
            if(err['_body']){
              errores(err.json());
            }else{
              this.error_conexion();
            }
          });
        }else{
          resolve(ls_respuesta);
        }

      });
    });
  }



  /**
   * CATEGORIAS
   * @param parametros parametros para enviar que idioma se consumira del backend
   * @param clear Si se borra o no el cache en caso de que haya o no internet
   */
  obtener_categorias(parametros,clear?){

    if(clear){
      this.storage.set('ls_categorias',undefined);
    }
    
    return new Promise((resolve, errores) => {

      this.storage.get('ls_categorias').then((ls_respuesta) => { 

        if(!ls_respuesta){
          this.authHttp.get(`${SERVER_URL}/categorias`+parametros)
          .subscribe(resultado => {
            let data = resultado.json();
            this.storage.set('ls_categorias',data);
            resolve(data);
          }, (err) => {
            if(err['_body']){
              errores(err.json());
            }else{
              this.error_conexion();
            }
          });
        }else{
          resolve(ls_respuesta);
        }

      });
    });
  }


  /**
   * PROMOCIONES
   * @param parametros parametros para enviar que idioma se consumira del backend
   * @param clear Si se borra o no el cache en caso de que haya o no internet
   */
  obtener_promociones(parametros,clear?){

    if(clear){
      this.storage.set('ls_promociones',undefined);
    }
    
    return new Promise((resolve, errores) => {

      this.storage.get('ls_promociones').then((ls_respuesta) => { 

        if(!ls_respuesta){
          this.authHttp.get(`${SERVER_URL}/promociones`+parametros)
          .subscribe(resultado => {
            let data = resultado.json();
            this.storage.set('ls_promociones',data);
            resolve(data);
          }, (err) => {
            if(err['_body']){
              errores(err.json());
            }else{
              this.error_conexion();
            }
          });
        }else{
          resolve(ls_respuesta);
        }

      });
    });
  }




  enviar_codigoqr(form){
    return new Promise((resolve, errores) => {

      this.authHttp.post(`${SERVER_URL}/escaneos`, form)
      .subscribe(res => {
        let data = res.json();
        resolve(data);

      }, (err) => {
        if(err['_body']){
          errores(err.json());
        }else{
          this.error_conexion();
        }
      });

    });
  }


  /**
   * Calificaciones
   */
  ratingdata : any = [];

  ScoreDefault(){
    this.ratingdata = [
      { id : 0, value: 1, icon: false },
      { id : 1, value: 2, icon: false },
      { id : 2, value: 3, icon: false },
      { id : 3, value: 4, icon: false },
      { id : 4, value: 5, icon: false }
    ]
    return  this.ratingdata;
  }

  get_list_stars(number){

    this.ratingdata = this.ScoreDefault();
    let i;
    //agregando calificacion en el caso de existir
    if(number > 0){
      
      let set_id_score = number;
      
      for(i = 0; i < this.ratingdata.length ; i++){
        if(i < set_id_score){
          this.ratingdata[i].icon = true;
        }else{
          this.ratingdata[i].icon = false;
        }
      }
      return this.ratingdata;
    }else{

      return this.ScoreDefault();

    }
  }


  calificaciones:any = [];
  obtener_calificaciones(id_esta,internet){

    return new Promise((resolve, errores) => {

      if(internet){

        this.authHttp.get(`${SERVER_URL}/calificaciones/`+id_esta)
        .subscribe(resultado => {

          let data = resultado.json();

          console.log('--->',data,id_esta);

          if(data.length == 0){
            resolve(0);
            return;
          }
          

          this.storage.get('ls_calificaciones').then((ls_respuesta) => { 

            console.log('LS CALIFICACIONES',ls_respuesta,'WS:',data);

            if(!ls_respuesta){
              console.log('primera');
              this.storage.set('ls_calificaciones',data);
              resolve(data[0]['total']);
            }else{

              

              this.calificaciones = ls_respuesta;

              for(let c = 0; c <  this.calificaciones.length; c++ ){

                console.log('Validaciones', id_esta ,  parseInt( this.calificaciones[c]['id_establecimiento'] ) );

                if(id_esta ==   parseInt( this.calificaciones[c]['id_establecimiento'] ) ){

                  this.calificaciones[c]['total'] = data[0]['total'];
                  this.storage.set('ls_calificaciones',this.calificaciones);
                  console.log('FINAL LS CALIFICACIONES',this.calificaciones);
                  resolve(data[0]['total']);
                  return;
                }
              }

              console.log('AGREGAR NUEVA CALIFICACION');
              this.calificaciones.push(data);
              resolve(data[0]['total']);
              return;
              
            }
    
          });


        }, (err) => {
          if(err['_body']){
            errores(err.json());
          }else{
            this.error_conexion();
          }
        });

      }else{

        this.storage.get('ls_calificaciones').then((ls_respuesta) => { 
          if(!ls_respuesta){
            resolve(0);
          }else{

            this.calificaciones = ls_respuesta;

            for(let c = 0; c <  this.calificaciones.length; c++ ){
              if(id_esta ==  this.calificaciones[c]['id_establecimiento']){
                resolve( this.calificaciones[c]['total'] );
              }else{
                if(c+1 == this.calificaciones.length){
                  resolve(0);
                }
              }

            }

          }

  
        });

      }

    });

  }


  calificar(form){
    return new Promise((resolve, errores) => {

      this.authHttp.post(`${SERVER_URL}/calificar`, form)
      .subscribe(res => {
        let data = res.json();
        resolve(data);

      }, (err) => {
        if(err['_body']){
          errores(err.json());
        }else{
          this.error_conexion();
        }
      });

    });
  }


  sincronizar(data){
    return new Promise((resolve, errores) => {

      this.authHttp.post(`${SERVER_URL}/sincronizar_escaneos`, data)
      .subscribe(res => {
        let data = res.json();
        resolve(data);

      }, (err) => {
        if(err['_body']){
          errores(err.json());
        }else{
          this.error_conexion();
        }
      });

    });
  }

actualizarPerfil(form){
  return new Promise((resolve, errores) => {

    this.authHttp.post(`${SERVER_URL}/actualizarCuenta`, form)
    .subscribe(res => {
      let data = res.json();
      resolve(data);

    }, (err) => {
      if(err['_body']){
        errores(err.json());
      }else{
        this.error_conexion();
      }
    });

  });
}
  
}
