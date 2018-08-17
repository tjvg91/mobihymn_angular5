import { Component, ViewChild } from '@angular/core';

import { Tabs, Slides, NavController, Platform } from 'ionic-angular';

import { HomePage } from '../home/home';
import { ReaderPage } from '../reader/reader';
import { SettingsPage } from '../settings/settings';
import { SearchPage } from '../search/search';
import { GlobalService } from '../../services/global-service';
import { IntroSliderComponent } from '../../components/intro-slider/intro-slider';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ReaderPage;
  tab3Root = SearchPage;
  tab4Root = SettingsPage;

  activeHymnal: string;
  activeHymn: string;

  @ViewChild('#myTabs') public tabRef: Tabs;

  constructor(myGlobal : GlobalService, private navCtrl: NavController, private platform: Platform) {
    this.activeHymnal = myGlobal.getActiveHymnal();
  }

  ionViewDidLoad(){
  }
}
