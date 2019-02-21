import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Events } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root: any;
  tab1Params:any;
  tab2Params:any;

  tab2Root: any = 'PromotionsPage';
  //tab3Root: any = 'StorePage';
 //tab4Root: any = 'ConfiguracionPage';
  tab3Root: any;

  myIndex: number;

  icon_home:string = 'icon-burger';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public events: Events
  ) {

    this.myIndex = this.navParams.data.tabIndex || 0;
    //console.log('INFORMACION', navParams.get("ciudad") );

    this.tab1Root = 'OfflinemapsPage';
    this.tab1Params = { ciudad: navParams.get("ciudad"), valor: navParams.get("valor"), coordenadas:navParams.get("coordenadas"), id_ciudad:navParams.get("id_ciudad")  };
    this.tab2Params = { store_id: navParams.get("store_id") };

    events.subscribe('tabs:icon', (icon) => {
      this.icon_home = icon;
    });

  }

  configuracion(){
    this.navCtrl.setRoot('ConfiguracionPage');
  }
}
