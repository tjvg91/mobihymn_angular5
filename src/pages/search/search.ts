import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Searchbar, LoadingController, Loading, ModalController } from 'ionic-angular';
import { SearchModalPage } from '../search-modal/search-modal';
import * as $ from 'jquery';

import { GlobalService } from '../../services/global-service';

/**
 * Generated class for the SearchPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  @ViewChild('searchHymn') hymnFilterSearchbar:Searchbar;
  hymnList: object;
  activeHymnal: string;
  searchItems: Array<object>;
  searchLoader: Loading;
  canBack: boolean;

  constructor(public searchCtrl: NavController, private loadingCtrl: LoadingController, public navParams: NavParams,
              private global : GlobalService, private modalCtrl: ModalController) {    
    this.hymnList = global.getHymnList();
    this.activeHymnal = global.getActiveHymnal();
  }

  ionViewDidEnter(){
    this.canBack = this.searchCtrl.parent._selectHistory.length > 0;
    
    //let modalDisplay = window.localStorage.getItem("modalDisplay");
    let modal = this.modalCtrl.create(SearchModalPage);
    modal.onDidDismiss(() => {
      window.localStorage.setItem("modalDisplay", "true");
    });
    modal.present();
    
    setTimeout(() => {
      this.hymnFilterSearchbar.setFocus();
    }, 500);
  }

  getItems(event){
    let th = this;
    setTimeout(function() {
      let st = event.target.value;
      if(st){
        st = st.trim();
        let activeHymnal = th.activeHymnal;
        th.searchItems = new Array<object>();
        let searchItems = th.searchItems;
        let isExact = /^\".+\"$/.test(st);
        th.hymnList['hymnal' + activeHymnal].forEach(hymn => {
          let lyrics = $(hymn.lyrics);
          let lines = lyrics.find('.hymn-line').filter(function(index, item){
            return isExact ? new RegExp("\\b" + st.replace(/\"/g, "") + "\\b", "i").test(item.textContent.replace(/[,;.!":?]/g, "")) :
            th.generateRegExCondition(st, item.textContent.replace(/[,;.!":?]/g, ""));
          });
          if(lines.length > 0){
            lines.each(function(ind, line){
              if(searchItems.findIndex(i => i['number'] == hymn['number'] && i['line'] == line.textContent) < 0){
                var posLine = lyrics.find(line).index();
                var posStanza = lyrics.find(line).parent().index();
                searchItems.push({
                  'id': hymn['id'],
                  'number': hymn['number'],
                  'line': line.textContent,
                  'posLine': posLine,
                  'posStanza': posStanza
                });  
              }
            })
          }
        });
        th.searchItems.sort(th.sortByLine);
        th.closeLoader();
      }
    }, 100);
    this.showLoader();
  }

  showLoader() {
    this.searchLoader = this.loadingCtrl.create({
      content: 'Searching...',
      spinner: 'circles'
    });

    this.searchLoader.present();
  }

  closeLoader(){
    this.searchLoader.dismiss();
  }

  goToReader(hymnId, posStanza, posLine){
    window.localStorage.setItem('scrollTo', JSON.stringify({posStanza: posStanza, posLine: posLine}));
    this.global.setActiveHymn(hymnId);
    this.searchCtrl.parent.select(0);
  }

  sortByLine (a,b) {
    var a1 = a.line.replace(/^(\"|\')/, "");
    var b1 = b.line.replace(/^(\"|\')/, "");
    if (a1 < b1)
        return -1;
    if ( a1 > b1 )
        return 1;
    return 0;
  }

  generateRegExCondition(str: string, line: string){
    let valArr = str.split(/\s+/g);
    let ret = true;
    valArr.forEach(val => {
      ret = ret && new RegExp(val, "i").test(line);
      if(!ret)
        return false;
    })
    return ret;
  }

  goBack(){
    let prevTab = this.searchCtrl.parent.previousTab(true);
    this.searchCtrl.parent.select(prevTab);
  }
}
