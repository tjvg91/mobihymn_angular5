import { Component, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
//import { WalkthroughFlowComponent } from 'angular-walkthrough'

import { IonicPage, NavController, PopoverController, ModalController, AlertController, ToastController, Gesture, Content, Platform } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';
import { InputModalPage } from '../../pages/input-modal/input-modal';
import { SettingsPopoverPage } from '../../pages/settings-popover/settings-popover';
import { TunePopoverPage } from '../../pages/tune-popover/tune-popover';
import { MidiPopoverPage } from '../../pages/midi-popover/midi-popover';

import { StatusBar } from '@ionic-native/status-bar'
import { File } from '@ionic-native/file';
import * as _ from 'lodash';
import * as MidiPlayer from 'midi-player-js';
import * as $ from 'jquery';

/**
 * Generated class for the ReaderPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reader',
  templateUrl: 'reader.html',
  animations: [
    trigger('scale', [
      state('hidden', style({
        transform: 'scale(0)'
      })),
      state('shown', style({
        transform: 'scale(1)'
      })),
      transition('hidden <=> shown', animate('500ms ease'))
    ]),
    trigger('slideUp', [
      state('up', style({
        transform: 'translate(0px, -50px)'
      })),
      state('down', style({
        transform: 'translate(0px, 0px)'
      })),
      transition('up <=> down', animate('500ms ease'))
    ])
  ]
})

export class ReaderPage implements OnDestroy{
  hymnList: Array<object>;
  hymnalList: Array<object>;
  myGlobal:GlobalService;
  currentHymn: object;
  activeHymnal: string;
  isBookmarked: boolean;
  canBack: boolean;
  gesture: Gesture;
  tunes: Array<string>;

  scaleState: string = 'shown';
  slideUpState: string = 'down';
  
  hymnSubscribe: any;
  bookmarksSubscribe: any;
  paddingSubscribe: any;
  themeSubscribe: any;
  fontSizeSubscribe: any;
  fontNameSubscribe: any;
  alignmentSubscribe: any;
  soundFontSubscribe: any;
  showStanzaSubscribe: any;

  extraSpace: Number = 0;
  alignment: string = "left";
  fontSize: number = 1.4;
  themeString: string = "pic";
  fontName: string = "Roboto";
  showStanza: boolean = true;

  curScale: number = 0;
  footerType: string = "";

  mdiPlayer: any;
  mdiLength: any = 0;
  mdiCur: any = 0;
  mdiSound: any;
  ac: AudioContext;

  scrollCur: any = 0;
  scrollInterval: any = 0;
  scrollTime: number = 500;

  private lyricsContainer: HTMLElement;
  @ViewChild('readerHeader') divHeader: ElementRef;
  @ViewChild('lyricsContainer') lyricsContainerRef: Content;
  @ViewChild('footerReader') footerReader: ElementRef;
  //@ViewChild('walkFlow1') walkFlow1: WalkthroughFlowComponent;
  scrollContent: any;
  divTab: any;

  mdiControl: Object = new Object();

  constructor(public readerCtrl: NavController, public inputPopCtrl: PopoverController, public inputModalCtrl: ModalController,
                    global: GlobalService, private alertCtrl: AlertController, private toastCtrl: ToastController, private platform: Platform,
                    private statusBar: StatusBar, private file: File) {
    this.myGlobal = global;

    this. mdiControl = {
      track       : "",
      cover       : "",
      dismissable : true,

      hasPrev   : false,
      hasNext   : false,
      hasClose  : false,
    }

    this.paddingSubscribe = global.paddingChange.subscribe((value) => {
      this.extraSpace = value;
    });

    this.hymnSubscribe = global.activeHymnChange.subscribe((value) => {
      this.activeHymnal = this.myGlobal.getActiveHymnal();
      let hymnList = this.myGlobal.getHymnList()['hymnal' + this.myGlobal.getActiveHymnal()];
      let activeHymn = value;
      let activeHymnal = this.activeHymnal;
      this.currentHymn = _.filter(hymnList, function(item){
        return item.id == activeHymn;
      })[0];
      let currentHymnNum = this.currentHymn['number'].replace(/f|s|t/i, "");
      this.tunes = _.filter(hymnList, function(item){
        return new RegExp('^' + currentHymnNum + "(f|s|t)", "i").test(item['number']);
      });
      this.isBookmarked = global.isInBookmark(this.activeHymnal, this.currentHymn['id']);
      let read = this;
      setTimeout(function() {
        read.initializePlayer();
      }, 100);
      this.mdiControl['cover'] = this.hymnalList.filter(function(val){
        return val['id'] == activeHymnal;
      })[0]['image'];
      this.mdiControl['track'] = "Hymn #" + this.currentHymn['title'];
        
    });

    this.bookmarksSubscribe = global.bookmarksChange.subscribe((value) => {
      this.isBookmarked = global.isInBookmark(this.activeHymnal, this.currentHymn['id']);
    });

    this.themeSubscribe = global.themeChange.subscribe((value) => {
      this.themeString = value;
    });

    this.fontSizeSubscribe = global.fontSizeChange.subscribe((value) =>{
      this.fontSize = value;
    });

    this.fontNameSubscribe = global.fontNameChange.subscribe((value) => {
      this.fontName = value;
    });

    this.alignmentSubscribe = global.activeAlignmentChange.subscribe((value) => {
      this.alignment = value;
    });
    
    this.soundFontSubscribe = global.soundFontChange.subscribe((value) => {
      this.mdiSound = value;
    });

    this.showStanzaSubscribe = global.showStanzaChange.subscribe(value => {
      this.showStanza = value;
    })
  }

  presentPopover(myEvent) {
    let popover = this.inputPopCtrl.create(SettingsPopoverPage,{
      ctrl: this,
    });
    popover.onDidDismiss(() => {
      window.localStorage.removeItem('data');
    })
    popover.present({
      ev: myEvent
    });
  }

  presentTunePopover(myEvent){
    let popover = this.inputPopCtrl.create(TunePopoverPage,{
      ctrl: this,
      tunes: this.tunes,
      activeHymn: this.currentHymn['number']
    });
    popover.present({
      ev: myEvent
    });
  }

  presentInputModal() {
    let hymns = this.hymnList;
    let inputModal = this.inputModalCtrl.create(InputModalPage, {
      allHymns : hymns,
      activeHymnal : this.activeHymnal,
      globalService: this.myGlobal
    });
    inputModal.present();
  }

  presentConfirmUnbookmark(){
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
            this.myGlobal.removeFromBookmarks(this.activeHymnal, this.currentHymn['id']);
            this.presentUnbookmarkConfirmed();
          }
        }
      ]
    });
    confirmUnbookmark.present();
  }

  presentBookmarkConfirmed(){
    let confirmedBookmark = this.toastCtrl.create({
      message: 'Bookmark added',
      duration: 3000
    });
    confirmedBookmark.present();
  }

  presentUnbookmarkConfirmed(){
    let confirmedUnbookmark = this.toastCtrl.create({
      message: 'Bookmark removed',
      duration: 3000
    });
    confirmedUnbookmark.present();
  }

  presentMidiPopover(myEvent){
    let inputModal = this.inputPopCtrl.create(MidiPopoverPage, {
      reader : this
    });
    inputModal.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    this.canBack = this.readerCtrl.parent._selectHistory.length > 0;
    this.lyricsContainer = this.lyricsContainerRef._elementRef.nativeElement;
    this.divTab = this.readerCtrl.parent._tabbar.nativeElement;
    
    this.activeHymnal = this.myGlobal.getActiveHymnal();
    let hymnList = this.myGlobal.getHymnList()['hymnal' + this.activeHymnal];
    this.hymnList = hymnList;

    if(this.activeHymnal == "2")
      this.syncOldBookmarks();
    this.hymnalList = this.myGlobal.getHymnalList();
    let activeHymn = this.myGlobal.getActiveHymn() ? this.myGlobal.getActiveHymn() : "1";
    this.currentHymn = _.filter(hymnList, function(item){
      return item.id == activeHymn;
    })[0];
    
    this.scrollContent = this.lyricsContainerRef.getNativeElement().querySelector('.scroll-content');
    this.scrollContent.scrollTop = 0;
      
    this.initializePlayer();
    this.isBookmarked = this.myGlobal.isInBookmark(this.activeHymnal, this.currentHymn);
    this.fontSize = this.myGlobal.getFontSize();
    this.extraSpace = this.myGlobal.getPadding();
    this.themeString = this.myGlobal.getTheme();
    this.fontName = this.myGlobal.getFontName();
    this.alignment = this.myGlobal.getActiveAlignment();
    let currentHymn = this.currentHymn;
    this.tunes = _.filter(hymnList, function(item){
      return new RegExp('^' + currentHymn['number'] + "(f|s|t)", "i").test(item['number']);
    });
    let activeHymnal = this.activeHymnal;
    this.mdiControl['cover'] = this.hymnalList.filter(function(val){
      return val['id'] == activeHymnal;
    })[0]['image'];
    this.mdiControl['track'] = "Hymn #" + this.currentHymn['title'];
    //this.walkFlow1.start();
  }

  ionViewDidEnter(){
    this.canBack = this.readerCtrl.parent._selectHistory.length > 0;
  }

  ngOnDestroy(){
    this.hymnSubscribe.unsubscribe();
    this.bookmarksSubscribe.unsubscribe();
    this.paddingSubscribe.unsubscribe();
    this.gesture.destroy();
  }

  goToTab(index){
    this.readerCtrl.parent.select(index);
  }

  toggleBookmark(){
    if(this.isBookmarked){
      this.presentConfirmUnbookmark();
    }
    else{
      this.myGlobal.addToBookmarks({
        'hymnalId': this.activeHymnal,
        'hymnId': this.currentHymn['id'],
        'firstLine': this.currentHymn['firstLine'],
        'number': this.currentHymn['number'],
        'title': this.currentHymn['title'],
        'date': new Date().getTime()
      });
      this.presentBookmarkConfirmed();
    }
  }

  pinchZoom(event){
    var val = this.curScale > event.scale ? -1 : 1
    this.zoom(val);
    this.curScale = event.scale;
  }

  toggleFullLyrics(ev){
      let margUp = "";
      let translateUpTab = "";
      let translateUpFooter = "";
      

      if(this.platform.is('android') || this.platform.is('core')){
        margUp = '43px 0 100px';
        translateUpTab = 'translate(0, 56px)';
        translateUpFooter = 'translate(0, 123px)';
      }
      else if(this.platform.is('ios')){
        margUp = '38px 0 80px';
        translateUpTab = 'translate(0, 56px)';
        translateUpFooter = 'translate(0, 115px)';
      }
      else{ //windows
        margUp = '35px 0 60px';
        translateUpTab = 'translate(0, -115px)';
        translateUpFooter = 'translate(0, 115px)';
      }

      if(this.scaleState == 'shown'){
        this.scrollContent.animate([
          { offset: 0, 'margin': margUp },
          { offset: 1, 'margin': '0 0 0 0' }
        ],{
          duration: 500,
          easing: 'ease',
          fill: 'forwards'
        });
        this.divTab.animate([
          { offset: 0, 'transform': 'translate(0, 0)' },
          { offset: 1, 'transform': translateUpTab }
        ],{
          duration: 500,
          easing: 'ease',
          fill: 'forwards'
        });
        this.footerReader.nativeElement.animate([
          { offset: 0, 'transform': 'translate(0, 0)' },
          { offset: 1, 'transform': translateUpFooter }
        ],{
          duration: 500,
          easing: 'ease',
          fill: 'forwards'
        });
        this.slideUpState = 'up';
        this.scaleState = 'hidden';
        //this.statusBar.hide();
      }
      else{
        this.scrollContent.animate([
          { offset: 0, margin: '0 0 0 0' },
          { offset: 1, margin: margUp }
        ],{
          duration: 500,
          easing: 'ease',
          fill: 'forwards'
        });
        this.divTab.animate([
          { offset: 0, 'transform': translateUpTab },
          { offset: 1, 'transform': 'translate(0, 0)' }
        ],{
          duration: 500,
          easing: 'ease',
          fill: 'forwards'
        });
        this.footerReader.nativeElement.animate([
          { offset: 0, 'transform': translateUpFooter },
          { offset: 1, 'transform': 'translate(0, 0)' }
        ],{
          duration: 500,
          easing: 'ease',
          fill: 'forwards'
        })

        this.slideUpState = 'down';
        this.scaleState = 'shown';
        //this.statusBar.show();
      }
  }

  @HostListener('mousewheel', ['$event'])
  scroll(e: WheelEvent) {
      if(e.ctrlKey){
        e.preventDefault();
        this.zoom(Math.sign(e.wheelDelta))
      }
  }

  zoom(sign: number){
    var prod = (0.1 * sign);
    let fontSize = sign < 0 ? Math.max(parseFloat((this.fontSize + prod).toFixed(2)), 1.4) :
                    Math.min(parseFloat((this.fontSize + prod).toFixed(2)), 3.6);
    this.myGlobal.setFontSize(fontSize);
  }

  getLyrics(){
    var tempDiv = $('<div></div>');
    tempDiv.append(this.currentHymn['lyrics'].replace(/<span class="hymn-line">([^<]+)<\/span>/g, "\r\n$1"));
    tempDiv.find('.hymn-stanza').wrapInner("<pre></pre>");
    return tempDiv.html();
  }

  initializePlayer(){
    let read = this;
    this.mdiPlayer = new MidiPlayer.Player(function(x) {
      if(x.name && x.name == "Note on"){
        try {
          read.mdiSound.play(x.noteNumber, read.ac.currentTime, {
            gain: x['velocity'] / 100
          });
        } catch (error) {
          read.stopTrack();
        }
      }
      read.mdiLength = parseInt(read.mdiPlayer.getSongTime());
      read.mdiCur = read.mdiLength - read.mdiPlayer.getSongTimeRemaining();
    });
    this.mdiPlayer.on('playing', function(){
      read.mdiCur = read.mdiLength - read.mdiPlayer.getSongTimeRemaining();
    });
    this.mdiPlayer.on('endOfFile', function(){
      read.stopTrack();
    })

    if(read.currentHymn['midi']){
      this.mdiPlayer.loadDataUri(read.currentHymn['midi']);
      this.mdiLength = parseInt(this.mdiPlayer.getSongTime());
      this.mdiCur = Math.max(0, parseInt(this.mdiPlayer.getSongTimeRemaining()));
    }
    else{
      this.mdiLength = 0;
      this.mdiCur = 0;
    }
    if(this.myGlobal.hymnSettings)
      if(this.myGlobal.hymnSettings[this.activeHymnal])
        if(this.myGlobal.hymnSettings[this.activeHymnal][this.currentHymn["id"]])
          if(this.myGlobal.hymnSettings[this.activeHymnal][this.currentHymn["id"]]["tempo"])
            this.mdiPlayer["tempo"] = this.myGlobal.hymnSettings[this.activeHymnal][this.currentHymn["id"]]["tempo"];

    this.mdiSound = this.myGlobal.soundfont;
    this.ac = this.myGlobal.ac;
  }

  playTrack(){
    this.mdiPlayer.play();
  }

  pauseTrack(){
    this.mdiPlayer.pause();
  }

  stopTrack(){
    let myTracks = [];
    this.mdiPlayer["tracks"].forEach((e, i) => {
      if(i != 0)
        myTracks.push(e["enabled"]);
    });
    this.mdiPlayer.stop();
    this.mdiCur = 0;
    for(let i = 1; i < this.mdiPlayer["tracks"].length; i++){      
      this.mdiPlayer["tracks"].filter(x => {
        return x["index"] == i;
      })[0]["enabled"] = myTracks[i - 1];
    }
  }

  syncOldBookmarks(){
    if(this.platform.is('cordova') && this.platform.is('android')){
      let hom = this;
      let path = this.file.externalRootDirectory;
      let folder = 'MobiHymnal/files/bookmarks';
      this.file.checkDir(path, folder).then(val => {
        this.file.listDir(path, folder).then(val2 => {
          val2.forEach((x, i, arr) => {
            let name = x.name.replace(/\.mkbk/, '');
            let actHymn = hom.hymnList.filter(y => {
              return y['number'] == name
            })[0];

            hom.myGlobal.addToBookmarks({
              'hymnalId': hom.activeHymnal,
              'hymnId': actHymn['id'],
              'firstLine': actHymn['firstLine'],
              'number': actHymn['number'],
              'title': actHymn['title']
            })
          });
          this.file.removeRecursively(path, 'MobiHymnal')
        })
      })
    }
  }


  mdiChange(ev){
    this.mdiPlayer.skipToSeconds(this.mdiCur);
  }

  secsToMins(secs){
    let num: number = secs;
    num /= 60;
    num = parseInt(num + '');
    return this.pad(num, 2) + ":" +  this.pad(secs % 60, 2);
  }

  pad(num, size) {
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
  }

  playScroll(){
    let read = this;
    this.scrollInterval = setInterval(() => {
      read.scrollContent.scrollTop += read.scrollCur;
      if(read.scrollContent.scrollTop + read.scrollContent.offsetHeight >= read.scrollContent.scrollHeight - 5){
        clearInterval(read.scrollInterval)
        read.scrollInterval = 0;
        return;
      }
    }, read.scrollTime);
  }

  pauseScroll(){
    clearInterval(this.scrollInterval);
    this.scrollInterval = 0;
  }

  scrollChange(event){
    let read = this;
    if(this.scrollInterval){
      clearInterval(read.scrollInterval);
      this.scrollInterval = setInterval(() => {
        read.scrollContent.scrollTop += (read.scrollCur);
        if(read.scrollContent.scrollTop + read.scrollContent.offsetHeight >= read.scrollContent.scrollHeight - 5){
          clearInterval(read.scrollInterval)
          read.scrollInterval = 0;
          return;
        }
      }, read.scrollTime);
    }
  }

  goBack(){
    let prevTab = this.readerCtrl.parent.previousTab(true);
    this.readerCtrl.parent.select(prevTab);
  }

  catchHighlightedText(ev){
    console.log(window.getSelection());
    console.log(ev);
  }
}
