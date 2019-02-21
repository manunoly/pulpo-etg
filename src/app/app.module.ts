import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { TerminosPage } from '../pages/terminos/terminos';
import {ResetpasswordPage} from '../pages/resetpassword/resetpassword';
import { StatusBar } from '@ionic-native/status-bar';
import {Storage, IonicStorageModule} from "@ionic/storage";
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpClientModule, HttpClient  } from '@angular/common/http'; //conexion con un cliente externo


import {JwtHelper, AuthConfig, AuthHttp} from "angular2-jwt";
import {Http, HttpModule, RequestOptions} from "@angular/http";
import { Network } from '@ionic-native/network';
import { Proveedor1Provider } from '../providers/proveedor1/proveedor1';
import { Geolocation } from '@ionic-native/geolocation'; //conexion google maps
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Zip } from '@ionic-native/zip';
import { NativeAudio } from '@ionic-native/native-audio';
import { IonicAudioModule, WebAudioProvider, CordovaMediaProvider, defaultAudioProviderFactory } from 'ionic-audio';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Geofence } from '@ionic-native/geofence';
//import { BackgroundMode } from '@ionic-native/background-mode';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function myCustomAudioProviderFactory() {
  return (window.hasOwnProperty('cordova')) ? new CordovaMediaProvider() : new WebAudioProvider();
} 

export function authHttpServiceFactory(http: Http, options: RequestOptions, storage: Storage) {
  const authConfig = new AuthConfig({
    tokenGetter: (() => storage.get('jwt')),
  });
  return new AuthHttp(authConfig, http, options);
}



@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    LoginPage,
    TerminosPage,
    ResetpasswordPage
    
  ],
  imports: [
    IonicAudioModule.forRoot(defaultAudioProviderFactory),    //audio
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule, //Declarar http del cliente externo}
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot({
      name: 'myapp',
      driverOrder: ['sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    LoginPage,
    TerminosPage,
    ResetpasswordPage
  ],
  providers: [
    BarcodeScanner,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Proveedor1Provider,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    JwtHelper, {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions, Storage]
    },
    FileTransfer,
    File,
    Zip,
    NativeAudio,
    Network,
    Geofence
  ]
})
export class AppModule {}
