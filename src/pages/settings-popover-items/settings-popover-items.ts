import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsPopoverListPage } from '../settings-popover-list/settings-popover-list';
import { GlobalService } from '../../services/global-service';

/**
 * Generated class for the SettingsPopoverItemsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings-popover-items',
  templateUrl: 'settings-popover-items.html',
})
export class SettingsPopoverItemsPage {
  activeList = "";
  paddingText: Number;
  alignmentText: string;
  themeText: string ;
  activeFontSize: number;
  activeFontName: string;

  global: GlobalService;
  data: any;

  fontSizes: Array<number> = [1.4, 1.9, 2.4, 2.9, 3.4];
  fontNames: Array<string> = ["Roboto", "Cookie", "Cormorant", "EB Garamond", "Give You Glory",
                              "Princess Sofia", "Redressed", "Dekko"]
  alignments = ["left", "center", "right"];
  themes = ["light", "tan", "dark", "black", "pic"];

  constructor(public navCtrl: NavController, public navParams: NavParams,) {
    this.activeList = this.navParams.get('dest');
    this.global = this.navParams.get('global');
    this.data = JSON.parse(window.localStorage.getItem('data'));
    this.activeFontName = this.data['fontName'];
    this.alignmentText = this.data['alignment'];
    this.themeText = this.data['theme'];
    this.paddingText = this.data['extraSpace'];
    this.activeFontSize = parseFloat(this.data['fontSize']);
  }

  goBack(){
    this.navCtrl.pop();
    /*this.navCtrl.pop({
      'global': this.global
    })*/
  }

  paddingChange(){
    this.global.setPadding(this.paddingText);
  }

  alignmentChange(){
    this.global.setActiveAlignment(this.alignmentText);
  }

  themeChange(){
    this.global.setTheme(this.themeText);
  }

  fontSizeChange(){
    this.global.setFontSize(this.activeFontSize);
  }

  fontNameChange(){
    this.global.setFontName(this.activeFontName);
  }
}
