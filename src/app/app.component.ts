import { Component, HostListener } from '@angular/core';
import { Platform, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Subscription } from 'rxjs';

import { GlobalService } from '../services/global-service';

import { TabsPage } from '../pages/tabs/tabs';

import { File } from '@ionic-native/file';
import { Insomnia } from '@ionic-native/insomnia';

@Component({
  templateUrl: 'app.html'
})
export class MyApp{
  rootPage:any = TabsPage;
  onPauseSubscription : Subscription

  android: boolean;
  ios: boolean;
  wp: boolean;

  storage: string;

  MAIN_FOLDER_NAME: string = "MobiHymn";
  BOOKMARKS_JSON_NAME: string = "bookmarks.json";
  HISTORY_JSON_NAME: string = "history.json";
  SETTINGS_JSON_NAME: string = "settings.json";

  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private global : GlobalService,
              private file: File, private insomnia: Insomnia, private app: App) {
    if(platform.is('cordova')){
      platform.ready().then(() => {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        statusBar.styleDefault();
        statusBar.hide();
        splashScreen.hide();
        insomnia.keepAwake();

        this.android = platform.is('android');
        this.ios = platform.is('ios');
        this.wp = platform.is('wp');

        this.storage = this.android ? file.externalRootDirectory : file.documentsDirectory;
        this.file.checkDir(this.storage, this.MAIN_FOLDER_NAME).then(() =>{
          this.checkBookmarks("read");
          this.checkHistory("read");
          this.checkSettings("read");
        }).catch(() => {
          this.file.createDir(this.storage, this.MAIN_FOLDER_NAME, false).then(() =>{
            this.checkBookmarks("read");
            this.checkHistory("read");
            this.checkSettings("read");
          });
        });

        this.onPauseSubscription = platform.pause.subscribe(() => {
          this.file.checkDir(this.storage, this.MAIN_FOLDER_NAME).then(() => {
            this.checkBookmarks("write");
            this.checkHistory("write");
            this.checkSettings("write");
          }).catch(() => {
            this.file.createDir(this.storage, this.MAIN_FOLDER_NAME, false).then(() =>{
              this.checkBookmarks("write");
              this.checkHistory("write");
              this.checkSettings("write");
            })
          });
        });       
        
      }); 

      platform.registerBackButtonAction(() => {
        var activeNav = app.getActiveNav();
        var activeModal = app._appRoot._modalPortal.getActive();
        var popupModal = app._appRoot._overlayPortal.getActive();
        if(activeModal)
          activeModal.dismiss();
        else if(popupModal)
          popupModal.dismiss();
        else if(activeNav.parent._selectHistory){
          let prevTab = activeNav.parent.previousTab(true);
          activeNav.parent.select(prevTab);
        }
      })
    }
    else{
      this.checkSettings("read");
    }
    console.log(this);
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(){
    if(!this.platform.is('cordova')){
      this.writeSettings(null);
    }
  }

  checkBookmarks(mode: string){
    this.file.checkFile(this.storage, this.BOOKMARKS_JSON_NAME).then(() => {
      if(mode == "write")
        this.writeBookmarks(true);
      else if (mode == "read")
        this.readBookmarks();
    }).catch(err => {
      this.file.createFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.BOOKMARKS_JSON_NAME, false).then(() => {
        if(mode == "write")
          this.writeBookmarks(false);
        else
          this.readBookmarks();
      }).catch(err => {
        if(err.message == "PATH_EXISTS_ERR")
          if(mode == "write")
            this.writeBookmarks(true);
          else
            this.readBookmarks();
      });
    });
  }

  writeBookmarks(exists: boolean){
    var data = this.global.getBookmarksList();
    if(!exists)
      this.file.writeFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.BOOKMARKS_JSON_NAME,
                          JSON.stringify(data), {
                            append: false, replace: true
                          });
    else
      this.file.writeExistingFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.BOOKMARKS_JSON_NAME,
                          JSON.stringify(data));
  }

  readBookmarks(){
    this.file.readAsText(this.storage + '/' + this.MAIN_FOLDER_NAME, this.BOOKMARKS_JSON_NAME).then((data) => {
      let bkmkArray = JSON.parse(data);
      this.global.bookmarks = bkmkArray;
    })
  }

  checkHistory(mode: string){
    this.file.checkFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.HISTORY_JSON_NAME).then(() => {
      if(mode == "write")
        this.writeHistory(true);
      else
        this.readHistory();
    }).catch(() => {
      this.file.createFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.HISTORY_JSON_NAME, false).then(() => {
        if(mode =="write")
          this.writeHistory(false);
        else
          this.readHistory();
      }).catch(err => {
        if(err.message == "PATH_EXISTS_ERR"){
          if(mode == "write")
            this.writeHistory(true);
          else
            this.readHistory();
        }
      })
    })
  }

  writeHistory(exists: boolean){
    var data = this.global.getRecentList();
    if(!exists)
      this.file.writeFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.HISTORY_JSON_NAME,
        JSON.stringify(data), {
          append: false, replace: true
      });
    else
      this.file.writeExistingFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.HISTORY_JSON_NAME,
        JSON.stringify(data));
  }

  readHistory(){
    this.file.readAsText(this.storage + '/' + this.MAIN_FOLDER_NAME, this.HISTORY_JSON_NAME).then((data) => {
      let histArray = JSON.parse(data);
      this.global.history = histArray;
    })
  }

  checkSettings(mode: string){
    if(this.platform.is('cordova')){
      let path = this.storage + '/' + this.MAIN_FOLDER_NAME;
      let filename = this.SETTINGS_JSON_NAME
      this.file.checkFile(path, filename).then(() => {
        if(mode == "write")
          this.writeSettings(true);
        else
          this.readSettings();
      }).catch(err => {
        if(err.message = "PATH_EXISTS_ERR"){
          if(mode == "read")
            this.readSettings();
          else
            this.writeSettings(true);
        }
        else{
          this.file.createFile(path, filename, false).then(() => {
            if(mode = "write")
              this.writeSettings(false);
          })
        }
      })
    }
    else{
      if(mode == "read"){
        this.readSettings();
      }
      else if(mode == "write"){
        this.writeSettings(null);
      }
    }
  }

  writeSettings(exists: boolean){
    var data = {
      'activeHymnal' : this.global.getActiveHymnal(),
      'activeHymn' : this.global.getActiveHymn(),
      'recentCount': this.global.getRecentCount(),
      'extraSpace' : this.global.getPadding(),
      'alignment': this.global.getActiveAlignment(),
      'fontSize' : this.global.getFontSize(),
      'fontName' : this.global.getFontName(),
      'theme': this.global.getTheme(),
      'hymnSettings': this.global.hymnSettings,
      'showStanza': this.global.getShowStanza()
    }
    if(this.platform.is('cordova')){
      if(!exists)
        this.file.writeFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.SETTINGS_JSON_NAME,
                            JSON.stringify(data), {
                              append: false, replace: true
                            })
      else
        this.file.writeExistingFile(this.storage + '/' + this.MAIN_FOLDER_NAME, this.SETTINGS_JSON_NAME,
                            JSON.stringify(data))                          
    }
    else{
      window.localStorage.setItem('settings', JSON.stringify(data));
    }
  }

  readSettings(){
    if(this.platform.is('cordova')){
      this.file.readAsText(this.storage + '/' + this.MAIN_FOLDER_NAME, this.SETTINGS_JSON_NAME).then((data) => {
        this.mapSettings(data);
      });
    }
    else{
      let data = window.localStorage.getItem('settings')
      if(data)
        this.mapSettings(data);
    }
    
  }

  mapSettings(data){
    let jsonData  = JSON.parse(data);
    this.global.setActiveHymnal(jsonData["activeHymnal"]);
    this.global.activeHymn = jsonData["activeHymn"];
    if(jsonData["fontSize"])
      this.global.setFontSize(jsonData["fontSize"]);
    if(jsonData["fontName"])
      this.global.setFontName(jsonData["fontName"]);
    if(jsonData["recentCount"])
      this.global.setRecentCount(jsonData["recentCount"]);
    if(jsonData["extraSpace"])
      this.global.setPadding(jsonData["extraSpace"]);
    if(jsonData["alignment"])
      this.global.setActiveAlignment(jsonData["alignment"]);
    if(jsonData["theme"])
      this.global.setTheme(jsonData['theme']);
    if(jsonData["hymnSettings"])
      this.global.hymnSettings = jsonData["hymnSettings"];
    if(jsonData["showStanza"])
      this.global.setShowStanza(jsonData["showStanza"]);
  
  }
}
