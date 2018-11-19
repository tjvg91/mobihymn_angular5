import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, ViewController, NavParams, Searchbar, AlertController, ToastController, Platform } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';
import { File } from '@ionic-native/file';

import * as _ from 'lodash';

/**
 * Generated class for the InputModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-input-modal',
  templateUrl: 'input-modal.html'
})

export class InputModalPage{
  inputType : string;
  myGlobal : GlobalService;
  hymnList: Array<object> = new Array<object>();
  activeHymnal: string;
  activeHymn: string;
  navParams: NavParams
  hymnSubscribe: any;
  hymnFilter: object;
  hymnFilterString: string
  recentList: Array<object>;
  bookmarkList: Array<object>;
  hymnTextFilter: string;

  @ViewChild('bkmkFilter') bkmkFilterSearchbar:Searchbar;
  @ViewChild('hymnFilter') hymnFilterSearchbar:Searchbar;

  origHymnList : Array<object>;
  origBkmkList : Array<object>;
  number: string;
  tune: string;
  keyboardShow: string;
  fileRoot: string;

  MAIN_FOLDER_NAME: string = "MobiHymn";
  BOOKMARKS_JSON_NAME: string = "bookmarks.json";
  HISTORY_JSON_NAME: string = "history.json";

  bkmkChangeSubscribe: any;

  second: number = 1000;
  minute: number = 1000 * 60;
  hour: number = 1000 * 60 * 60;
  day: number = 1000 * 60 * 60 * 24;
  week: number = 1000 * 60 * 60 * 24 * 7;
  month: number = 1000 * 60 * 60 * 24 * 30;
  year: number = 1000 * 60 * 60 * 24 * 365;

  constructor(public viewCtrl: ViewController, inputParams: NavParams,
            private alertCtrl: AlertController, private toastCtrl: ToastController,
            private file: File, private platform: Platform, private global: GlobalService,
            private chngr: ChangeDetectorRef) {
    this.inputType = "all_hymns";
    this.navParams = inputParams;

    this.fileRoot = platform.is('android') ? file.externalRootDirectory : file.documentsDirectory;

    this.bkmkChangeSubscribe = global.bookmarksChange.subscribe(val => {
      this.bookmarkList = val;
      this.origBkmkList = this.bookmarkList.map(x => Object.assign({}, x));
    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad(){
    this.activeHymnal = this.navParams.get('activeHymnal');
    this.myGlobal = this.navParams.get('globalService');
    
    this.activeHymn = this.myGlobal.getActiveHymn();
    let activeHymn = this.activeHymn
    this.hymnFilter = {
      'number': '',
      'tune': ''
    };

    this.origHymnList = this.navParams.get('allHymns').filter(x => {
      return !/f|s|t/ig.test(x['number']);
    });
    this.recentList = this.myGlobal.getRecentList();    
    this.bookmarkList = this.myGlobal.getBookmarksList();
    this.origBkmkList = this.bookmarkList.map(x => Object.assign({}, x));
    this.hymnList = this.origHymnList.map(x => Object.assign({}, x))

    this.hymnFilterString = _.filter(this.hymnList, item => {
      return item.id == activeHymn;
    })[0].number.replace(/f|s|t/, '');

    let inp = this;

    this.recentList = this.recentList.map(val => {
      val['ago'] = inp.getDateDiff(val['date']);
      return val;
    });

    this.bookmarkList = this.bookmarkList.map(val => {
      val['ago'] = inp.getDateDiff(val['date']);
      return val;
    });
  }

  ngAfterViewInit(){
    this.chngr.detectChanges();
    setTimeout(() => {
      this.hymnFilterSearchbar.value = this.hymnFilterString;
      this.filterHymns(null);
      this.hymnFilterSearchbar.setFocus();
      setTimeout(() => {
        this.hymnFilterSearchbar._searchbarInput.nativeElement.select();
      }, 500);
    }, 500);
  }

  getDateDiff(date){
    let now = new Date();
    let itemDate = new Date(date)
    let diff = now.getTime() - itemDate.getTime();
    if(diff < this.second)
      return "now";
    else if(diff < this.minute)
      return (diff / this.second).toFixed(0) + "s";
    else if(diff < this.hour)
      return (diff / this.minute).toFixed(0) + "m";
    else if(diff < this.day)
      return (diff / this.hour).toFixed(0) + "h";
    else if(diff < this.week)
      return (diff / this.day).toFixed(0) + "d";
    else if(diff < this.month)
      return (diff / this.week).toFixed(0) + "w";
    else if(diff < this.year)
      return (diff / this.month).toFixed(0) + "M";
    else
      return (diff / this.year).toFixed(0) + "y";
      
  }

  filterHymns(event){
    let st = ""
    if(event)
      st = event.target.value;
    else
      st = this.hymnFilterSearchbar.value;

    if(st)
      this.hymnList = this.origHymnList.filter((item) => {
        return new RegExp(st).test(item['number']) || new RegExp(st).test(item['firstLine']);
      });
    else
      this.hymnList = this.origHymnList;
  }

  filterBookmarks(event){
    let st = event.target.value;
    if(st)
      this.bookmarkList = this.origBkmkList.filter((item) => {
        return new RegExp(st).test(item['number']) || new RegExp(st).test(item['firstLine']);
      });
    else
      this.bookmarkList = this.origBkmkList;
  }

  preSetActiveHymn(event){
    let tempId = _.filter(this.hymnList, item => {
      return item.number == event;
    })[0].id;
    this.setActiveHymn(tempId);
  }

  setActiveHymn(hymnId){
    this.myGlobal.setActiveHymn(hymnId);
    this.viewCtrl.dismiss();
  }

  bkmkSelect(){
    setTimeout(() => {
      //this.bkmkFilterSearchbar.setFocus();
    }, 200);    
  }

  hymnSelect(){
    setTimeout(() => {
      this.hymnFilterSearchbar.setFocus();
      this.hymnFilterSearchbar._searchbarInput.nativeElement.select();
    }, 200);    
  }

  presentConfirmUnbookmark(hymn){
    let confirmUnbookmark = this.alertCtrl.create({
      title: 'Confirm removal',
      message: 'Are you sure you want to remove bookmark?',
      buttons: [
        {
          text: 'No',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.myGlobal.removeFromBookmarks(this.activeHymnal, hymn);
            this.presentUnbookmarkConfirmed();
          }
        }
      ]
    });
    confirmUnbookmark.present();
  }

  presentUnbookmarkConfirmed(){
    let confirmedUnbookmark = this.toastCtrl.create({
      message: 'Bookmark removed',
      duration: 3000
    });
    confirmedUnbookmark.present();
  }

  refreshBookmarks(){
    let path = this.fileRoot + '/' + this.MAIN_FOLDER_NAME;
    this.file.readAsText(path, this.BOOKMARKS_JSON_NAME).then((data) => {
      let jsonData = JSON.parse(data);
      this.global.bookmarks = jsonData;
      this.bookmarkList = jsonData;
    });
  }

  refreshRecent(){
    let path = this.fileRoot + '/' + this.MAIN_FOLDER_NAME;
    this.file.readAsText(path, this.HISTORY_JSON_NAME).then((data) => {
      let jsonData = JSON.parse(data);
      this.global.history = jsonData;
      this.recentList = jsonData;
    });
  }
}

