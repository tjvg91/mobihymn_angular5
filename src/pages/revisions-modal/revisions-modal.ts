import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the RevisionsModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-revisions-modal',
  templateUrl: 'revisions-modal.html',
})
export class RevisionsModalPage {
  revisionString : string;
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.revisionString = this.navParams.get('revisionString');
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }
}
