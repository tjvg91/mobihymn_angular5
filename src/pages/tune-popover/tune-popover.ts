import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';

import * as _ from 'lodash';

/**
 * Generated class for the TunePopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tune-popover',
  templateUrl: 'tune-popover.html',
})
export class TunePopoverPage {
  tunes: Array<Object>;
  activeTune: string;
  activeHymn: string;
  tunesString: Array<string> = ["-", "s", "t", "f"];
  ctrl: any;
  global: GlobalService;

  constructor(public navCtrl: NavController, private navParams: NavParams) {

  }

  ionViewDidLoad() {
    this.ctrl = this.navParams.get('ctrl');
    this.global = this.ctrl['myGlobal'];
    this.tunes = new Array<Object>();    
    for(let i = 0; i < this.navParams.get('tunes').length + 1; i++){
      var obj = {
        "name": (this.numToOrdinal(i + 1) + " tune"),
        "val": this.tunesString[i]
      };
      this.tunes.push(obj);
    }
    this.activeHymn = this.navParams.get('activeHymn');
    let activeHymn = this.activeHymn.replace(/[0-9]+/, "");
    if(activeHymn.length == 0)
      activeHymn = "-"
    this.activeTune = _.filter(this.tunes, x => {
      return x['val'] == activeHymn;
    })[0]['val'];

  }

  numToOrdinal(num){
    return /1$/.test(num) ? (num + "st") :
    /2$/.test(num) ? (num + "nd") :
    /3$/.test(num) ? (num + "rd") :
    (num + "th");
  }

  tuneChange(myEvent){
    if(this.activeTune){
      let newNum = this.activeHymn.replace(/f|s|t/, "") + "" + this.activeTune.replace("-", "");
      let hymnList = this.ctrl['hymnList'];
      let hymnId = _.filter(hymnList, x => {
        return x['number'] == newNum;
      })[0]['id'];
      this.global.setActiveHymn(hymnId);
    }
  }
}
