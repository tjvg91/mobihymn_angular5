import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';

/**
 * Generated class for the HymnalInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-hymnal-info',
  templateUrl: 'hymnal-info.html',
})
export class HymnalInfoPage {
  activeHymnal: Object;
  curHymns: Array<Object>;
  constructor(public viewCtrl: ViewController, public navParams: NavParams, private global: GlobalService) {
  }

  ionViewDidLoad() {
    let hymnalId = this.navParams.get('hymnalId');
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
