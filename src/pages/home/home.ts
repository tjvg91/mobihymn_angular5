import { Component, OnDestroy, HostListener } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, Platform, LoadingController, AlertController, ModalController } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';
import { UserService } from '../../services/user-service';
import { Network } from '@ionic-native/network';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import * as _ from 'lodash';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy{
  title: string;
  hymnalList: Array<object>;
  offlineHymnalList: Array<object> = new Array<object>();
  onlineHymnalList: Array<object>;
  hymnList: Array<object>;
  myHttp: Http;
  myGlobal: GlobalService;
  readerLoader: any;
  isOnline: boolean = true;
  isCordova: boolean = false;
  fetching: boolean = false;

  hymnalSubscribe: any;
  activeHymnalSubscribe: any;
  loadingHymnalsInfo: any;

  activeHymnal: string;
  progressIndicator: string = "0";
  
  firebaseRegEx: RegExp = /https\:\/\/[^/]*\//;
  firebaseStorage = '/storageapi/';
  fileTransferObj: FileTransferObject;

  android: boolean;
  ios: boolean;  
  wp: boolean;
  desktop: boolean;

  canBack: boolean;
  storage: string;
  index: any;

  fbHymnalsDateModified: Number;
  userHymnalsDateModified: Number;

  constructor(public homeCtrl: NavController, global : GlobalService, http: Http, private platform: Platform,
              private loadingCtrl: LoadingController, private network: Network, private fileTransfer: FileTransfer,
              private alertCtrl: AlertController, private file: File, private user: UserService, private modalCtrl: ModalController) {
    this.title = "MobiHymn";
    this.myGlobal = global;

    this.myHttp = http;
    let hom = this;

    this.fileTransferObj = fileTransfer.create();

    this.hymnalSubscribe = global.hymnalChange.subscribe((value) => {
      this.hymnalList = value;
      if(this.isOnline)
        this.onlineHymnalList = hom.hymnalList.filter(function(obj1){
          return !hom.offlineHymnalList.some(function(obj2) {
              return obj1['id'] == obj2['id'];
          });
        });
      
      if(this.activeHymnal){
        var tempAct = this.hymnalList.filter(x => {
          return x['id'] == hom.activeHymnal;
        })
        if(tempAct.length > 0)
          this.setActiveHymnal(this.activeHymnal);
      }
    });

    this.activeHymnalSubscribe = global.activeHymnalChange.subscribe(val => {
      if(val){
        this.showLoader();
        if(this.isCordova){
          this.getOfflineHymns();
        }
        else{
          this.myGlobal.firebaseAuth.onAuthStateChanged(function(user){
            if(user){
              hom.myGlobal.firebaseStorage.child('hymnal ' + hom.activeHymnal + '.json').getDownloadURL().then(function(url){
                var newUrl = hom.platform.is('cordova') ? url :
                        url.replace(hom.firebaseRegEx, hom.firebaseStorage);
                hom.myHttp.get(newUrl).map(x => x.json()).subscribe(x => {
                  hom.myGlobal.addToHymns('hymnal' + hom.activeHymnal, x)
                  hom.myGlobal.setActiveHymn('1');
                  hom.dismissLoader();
                  hom.goToReader(true);
                })
              });
            }
          })
        }
        this.activeHymnal = val;        
      }
    });

    if(this.platform.is('cordova'))
      this.platform.ready().then(() => {
        this.myGlobal.getSoundfonts().then(function(instru){
          hom.myGlobal.setSoundFont(instru);
        });
      })
    else{
      this.myGlobal.getSoundfonts().then(function(instru){
        hom.myGlobal.setSoundFont(instru);
      });
    }

    this.android = platform.is('android');
    this.ios = platform.is('ios');
    this.wp = platform.is('wp');
    this.desktop = window.innerWidth >= 1024 && !this.platform.is('cordova');

    this.storage = this.android ? file.externalRootDirectory : file.documentsDirectory;

    this.showLogin();
  }

  
  @HostListener('window:resize')
  onResize(){
    this.desktop = window.innerWidth >= 1024 && !this.platform.is('cordova');
  }
  
  setActiveHymnal(hymnalId : string){
      let activeHymnal = _.filter(this.hymnalList, function(h){
        return h.id == hymnalId;
      })[0]
      this.myGlobal.setActiveHymnal(activeHymnal['id']);
  }

  goToReader(enable: boolean){
    this.homeCtrl.parent.getByIndex(0).enabled = enable;
    this.homeCtrl.parent.getByIndex(1).enabled = enable;
    this.homeCtrl.parent.select(0);
  }

  ionViewDidLoad(){
    this.canBack = this.homeCtrl.parent._selectHistory.length > 0;
    this.getFBHymnalsDateModified();
    this.activeHymnal = this.myGlobal.getActiveHymnal();
    if(this.platform.is('cordova')){
      
      this.isCordova = true;
      this.network.onConnect().subscribe(data => {
        this.isOnline = true;
        this.fetching = true;
        if(!this.myGlobal.isAuthenticated)
            this.myGlobal.firebaseAuth.signInWithEmailAndPassword("tim.gandionco@gmail.com", "Tjvg1991");
            //this.showLogin();
        if(this.hymnalList == undefined){
          this.retrieveHymnals();
        }
      });
      this.network.onDisconnect().subscribe(data => {
        this.isOnline = false;
      });
      this.fetching = true;
      this.retrieveHymnals();
    }
    else{
      this.fetching = true;
      this.isOnline = navigator.onLine;
      this.retrieveHymnals();
    }
  }

  getHymnalsFirebase(){
    return this.myGlobal.firebaseStorage.child('hymnals.json').getDownloadURL();
  }

  getFBHymnalsDateModified(){
    let hom = this;
    this.myGlobal.firebaseAuth.onAuthStateChanged(user => {
      if(user){
        this.myGlobal.firebaseStorage.child('hymnals.json').getMetadata().then(metadata => {
          hom.fbHymnalsDateModified = new Date(metadata.updated).valueOf();
          if(hom.userHymnalsDateModified && hom.fbHymnalsDateModified > hom.userHymnalsDateModified){
            hom.saveHymnals();
          }
        }, err => {
          alert(err);
        });
      }
    }, err => {
      alert(err);
    });    
  }

  getUserHymnalsDateModified(){
    let hom = this;
    this.file.resolveDirectoryUrl(this.storage).then(rootDir => {
      hom.file.getFile(rootDir, 'MobiHymn/hymnals.json', { create: false }).then(fileEntry => {
        fileEntry.getMetadata(metadata => {          
          hom.userHymnalsDateModified = metadata.modificationTime.valueOf();
          if(hom.fbHymnalsDateModified && hom.userHymnalsDateModified > hom.fbHymnalsDateModified){
            hom.presentHymnalsInfoUpdating();
            hom.saveHymnals();
          }
        })
      })
    })
  }

  /*getFBHymnalMetadata(){
    this.offlineHymnalList.forEach(x => {
      
    })
  }*/

  retrieveHymnals(){
    let hom = this;
    this.platform.ready().then(() => {
      this.myGlobal.getHymnals(this.myHttp).subscribe(res => {
        hom.offlineHymnalList = res;
        hom.myGlobal.setHymnals(res);
        hom.fetching = false;
      });
    });
    this.myGlobal.firebaseAuth.onAuthStateChanged(function(user){
      if(user){
        hom.fetching = true;
        hom.getHymnalsFirebase().then(function(url){
          var newUrl = hom.platform.is('cordova') ? url :
                      url.replace(hom.firebaseRegEx, hom.firebaseStorage);
          hom.myHttp.get(newUrl).map(x => x.json()).subscribe(x => {
            hom.myGlobal.addToHymnals(x.output);
            hom.fetching = false;
          });
        }).catch(function(err){
        });
      }
    });
    this.activeHymnal = this.myGlobal.getActiveHymnal();
  }

  saveHymnals(){
    let url = ""
    let hom = this;
    if(this.platform.is('android'))
      url = this.file.externalRootDirectory;
    else if(this.platform.is('ios'))
      url = this.file.documentsDirectory;
    
    this.file.checkFile(url + '/MobiHymn', 'hymnals.json').then(() => {
      url += '/MobiHymn/hymnals.json';
      hom.myHttp.post(url, JSON.stringify(hom.offlineHymnalList));

      if(hom.userHymnalsDateModified)
        hom.loadingHymnalsInfo.dismiss();
    }, err => {
      hom.file.createFile(url + '/MobiHymn', 'hymnals.json', true).then(() => {
        this.file.writeFile(url + '/MobiHymn', 'hymnals.json', JSON.stringify(hom.offlineHymnalList), {
          append: false, replace: true
        });
      }, err => {
        alert("Error creating file: " + err);
      })
    })
  }

  downloadHymns(){
    let hom = this;
    let target = hom.platform.is('android') ? hom.file.externalRootDirectory :
                          hom.file.documentsDirectory;
    target += '/MobiHymn/hymnal ' + hom.activeHymnal + '.json';
    this.myGlobal.firebaseAuth.onAuthStateChanged(function(user){
      if(user){
        hom.myGlobal.firebaseStorage.child('hymnal ' + hom.activeHymnal + '.json').getDownloadURL().then(function(url){
          var newUrl = hom.platform.is('cordova') ? url :
                  url.replace(hom.firebaseRegEx, hom.firebaseStorage);
          let progressLoad = hom.loadingCtrl.create({
            content: 'Downloading 0%...',
            spinner: 'circles'
          });
          progressLoad.present();
          hom.fileTransferObj.onProgress(x => {
            let progressIndicator = ((x.loaded / x.total) * 100).toFixed(0);
            progressLoad.setContent('Downloading ' + progressIndicator + '%...');
          })
          hom.fileTransferObj.download(newUrl, target, true).then(x => {
            progressLoad.dismiss();
            hom.myGlobal.getHymns(hom.myHttp, parseInt(hom.activeHymnal)).subscribe(x =>{
              hom.myGlobal.addToHymns('hymnal' + hom.activeHymnal, x);
              let activeHymn = hom.myGlobal.getActiveHymn();
              if(!activeHymn)
                hom.myGlobal.setActiveHymn('1');
              let item = hom.hymnalList.filter(function(y){
                return y['id'] == hom.activeHymnal;
              })[0];
              hom.offlineHymnalList.push(item);
              hom.onlineHymnalList = _.difference(hom.hymnalList, hom.offlineHymnalList);
              hom.saveHymnals();
              this.dismissLoader();
              hom.goToReader(true);
            }, err => {
              alert(err);
            });
            
          }, err => {
            progressLoad.dismiss();
            let downloadErr = hom.alertCtrl.create({
              title: 'Error',
              message: 'Error downloading! Check internet connection.',
              buttons: [{
                text: 'OK',
                handler: () => {
                  downloadErr.dismiss();
                }
              }]
            });
            downloadErr.present();               
          })
        });
      }
    });
  }

  getOfflineHymns(){
    let hom = this;
    this.myGlobal.getHymns(this.myHttp, parseInt(hom.activeHymnal)).subscribe(res1 => {
      this.myGlobal.addToHymns('hymnal' + hom.activeHymnal, res1);
      let curHymn = this.myGlobal.getActiveHymn();
      if(!curHymn)
        this.myGlobal.setActiveHymn('1');
      this.dismissLoader();
      this.goToReader(true);
    }, err => {
      if(this.isCordova){
        this.dismissLoader();
        if(this.isOnline)
          this.downloadHymns();
      }
      else{
        this.myGlobal.firebaseAuth.onAuthStateChanged(function(user){
          if(user){
            hom.myGlobal.firebaseStorage.child('hymnal ' + hom.activeHymnal + '.json').getDownloadURL().then(function(url){
              var newUrl = hom.platform.is('cordova') ? url :
                      url.replace(hom.firebaseRegEx, hom.firebaseStorage);
              hom.myHttp.get(newUrl).map(x => x.json()).subscribe(x => {
                hom.myGlobal.addToHymns('hymnal' + hom.activeHymnal, x)
                hom.myGlobal.setActiveHymn('1');
                hom.dismissLoader();
                hom.goToReader(true);
              })
            });
          }
        })
      }
    });
  }

  presentHymnalsInfoUpdating(){
    this.loadingHymnalsInfo = this.loadingCtrl.create({
      content: 'Updating hymnals info',
      spinner: 'circles'
    });
    this.loadingHymnalsInfo.present();
  }

  comparer(otherArray){
    return function(current){
      return otherArray.filter(function(other){
        return other['id'] == current['id']
      }).length == 0;
    }
  }

  showLoader() {
    this.readerLoader = this.loadingCtrl.create({
      content: 'Getting settings...',
      spinner: 'circles'
    });

    this.readerLoader.present();
  }

  showLogin(){
    /*if(!this.myGlobal.firebaseAuth.currentUser){
      this.modalCtrl.create(LoginModalPage).present();
    }*/
  }

  dismissLoader(){
    if(this.readerLoader)
      this.readerLoader.dismiss();
  }

  ngOnDestroy(){
    this.hymnalSubscribe.unsubscribe();
    this.activeHymnalSubscribe.unsubscribe();
  }

  goBack(){
    
  }
}