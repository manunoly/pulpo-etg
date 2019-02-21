import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {Storage} from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-steps',
  templateUrl: 'steps.html',
})
export class StepsPage {

  suscription_data;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private readonly storage: Storage,
    private readonly statusBar: StatusBar,) {

    //this.statusBar.overlaysWebView(true);
    //this.statusBar.backgroundColorByHexString('#fff');
    

    this.storage.get('data-user').then((val) => {
     // this.suscription_data = val.suscription_store;
    });
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StepsPage');
  }

  slides = [
    {
      title: "Bienvenido a Yego!",
      description: "Yego es una plataforma de comunicación que permite que las empresas y sus públicos tener una comunicación directa y efectiva.",
      image: "../assets/img/splash_001.jpg",
      class: 'slide_001_bg',
    },
    {
      title: "¿Qué es Yego?",
      description: "Mediante nuestra plataforma, las empresas arman contenidos fáciles y entretenidos para ser comunicados mediante nuestra  app ",
      image: "../assets/img/splash_002.jpg",
      class: 'slide_002_bg'
    }
  ];

  goLogin(){
    this.storage.set('ls_firstStart', true);
    this.navCtrl.setRoot('ConfiguracionPage');
  }

  stepsSkip(){
    this.storage.set('ls_firstStart', true);
    this.navCtrl.setRoot('ConfiguracionPage');
  }

}
