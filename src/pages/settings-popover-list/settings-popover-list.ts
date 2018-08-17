import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsPopoverItemsPage } from '../settings-popover-items/settings-popover-items';
import { GlobalService } from '../../services/global-service';

/**
 * Generated class for the SettingsPopoverListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings-popover-list',
  templateUrl: 'settings-popover-list.html',
})
export class SettingsPopoverListPage {
  global: GlobalService;
  settingsList = ["Alignment", "Theme", "Font Size", "Font Name", "Extra Spacing"];
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidEnter(){
    this.global = this.navParams.get('global');
    var data = {
      'extraSpace' : this.global.getPadding(),
      'alignment': this.global.getActiveAlignment(),
      'fontSize' : this.global.getFontSize(),
      'fontName' : this.global.getFontName(),
      'theme': this.global.getTheme()
    }
    window.localStorage.setItem('data', JSON.stringify(data));
  }

  goToItems(setting){
    let global = this.global;
    this.navCtrl.push(SettingsPopoverItemsPage, {
      'dest': setting,
      'global': global
    });
  }

}
