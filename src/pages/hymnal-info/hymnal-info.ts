import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';
import { Platform } from "ionic-angular";

@IonicPage()
@Component({
  selector: 'page-hymnal-info',
  templateUrl: 'hymnal-info.html',
})
export class HymnalInfoPage {
  activeHymnal: Object;
  curHymns: Array<Object>;
  isCordova: boolean;
  isOffline: boolean;
  constructor(public viewCtrl: ViewController, public navParams: NavParams, private global: GlobalService,
            private platform: Platform) {
    platform.ready().then(() => {
      this.isCordova = platform.is('cordova');
    });
  }

  ionViewDidLoad() {
    let hymnalId = this.navParams.get('hymnalId');
    this.isOffline = this.navParams.get('isOffline');
    this.activeHymnal = this.global.getHymnalList().filter(x => {
      return x['id'] == hymnalId;
    })[0];
    this.curHymns = this.global.getHymnList()['hymnal' + hymnalId];
  }

  dismiss(data){
    if(data)
      this.viewCtrl.dismiss(data);
    else
      this.viewCtrl.dismiss();
  }

}
