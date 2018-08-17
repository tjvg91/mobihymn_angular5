import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { SettingsPopoverListPage } from '../settings-popover-list/settings-popover-list';
import { GlobalService } from '../../services/global-service';

@IonicPage()
@Component({
  selector: 'page-settings-popover',
  templateUrl: 'settings-popover.html',
})
export class SettingsPopoverPage {
  rootPage = SettingsPopoverListPage;
  global: GlobalService
  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
    let main = this.navParams.get('ctrl');
    this.global = main['myGlobal'];
  }
}
