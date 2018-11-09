import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
import * as SoundFont from 'soundfont-player';
import * as Firebase from 'firebase';
import 'firebase/firestore';

import 'rxjs/Rx';

@Injectable()
export class GlobalService {
    hymnals:Array<object> = new Array<object>();
    hymns:object = {};

    activeHymnal:string = "";
    activeHymn:string = "";
    activeAlignment="left";

    public bookmarks: Array<object> = new Array<object>();
    public history: Array<object> = new Array<object>();
    public hymnSettings: Object;
    
    recentCount:number = 5;
    padding: Number=0;
    fontSize: number = 1.4;
    fontName: string = "Roboto"
    theme: string = "light";
    showStanza: boolean = true;
    public instrument: Object = {
        "name" : "piano",
        "value": "acoustic_grand_piano-mp3"
    };
    public soundfont: object;
    public ac: AudioContext;

    public fireConfig: Object;
    public firebaseApp: Firebase.app.App;
    public firebaseStorage: Firebase.storage.Reference;
    public firebaseAuth: Firebase.auth.Auth;
    public firebaseAuthGmailProvider: Firebase.auth.GoogleAuthProvider;
    public firebaseAuthFBProvider: Firebase.auth.FacebookAuthProvider;
    public firebaseCollection: Firebase.firestore.Firestore;
    public isAuthenticated: boolean = false;
    
    public hymnalChange : Subject<Array<object>> = new Subject<Array<object>>();
    public hymnChange : Subject<object> = new Subject<object>();
    public activeHymnalChange : Subject<string> = new Subject<string>(); 
    public activeHymnChange : Subject<string> = new Subject<string>(); 
    public bookmarksChange : Subject<Array<object>> = new Subject<Array<object>>(); 
    public historyChange : Subject<Array<object>> = new Subject<Array<object>>(); 
    public historyCountChange : Subject<number> = new Subject<number>(); 
    public paddingChange : Subject<Number> = new Subject<Number>(); 
    public activeAlignmentChange : Subject<string> = new Subject<string>(); 
    public fontSizeChange : Subject<number> = new Subject<number>();
    public fontNameChange : Subject<string> = new Subject<string>();
    public themeChange : Subject<string> = new Subject<string>();
    public soundFontChange: Subject<object> = new Subject<object>();
    public showStanzaChange: Subject<boolean> = new Subject<boolean>();

    constructor(private file: File, private platform: Platform) {
        this.fireConfig = {
            apiKey: "AIzaSyBgPT51lOzkH0Lwb63r0s4iQoyKgn2VuSY",
            authDomain: "mobihymn.firebaseapp.com",
            databaseURL: "https://mobihymn.firebaseio.com",
            projectId: "mobihymn",
            storageBucket: "mobihymn.appspot.com",
            messagingSenderId: "525477034225"
        };
        let global = this;
        this.firebaseApp = Firebase.initializeApp(this.fireConfig);
        this.firebaseAuth = Firebase.auth(this.firebaseApp);
        this.firebaseAuthGmailProvider = new Firebase.auth.GoogleAuthProvider();
        this.firebaseAuthFBProvider = new Firebase.auth.FacebookAuthProvider();
        this.firebaseCollection = this.firebaseApp.firestore();

        this.firebaseAuth.onAuthStateChanged(function(user){
            if(user){
                global.isAuthenticated = true;
                global.firebaseStorage = Firebase.storage().ref();            
            }
        });
        this.firebaseAuth.signInWithEmailAndPassword("tim.gandionco@gmail.com", "Tjvg1991")
     }

    setHymnals(newValue:Array<object>) {        
        this.hymnals = newValue;        
        this.hymnalChange.next(this.hymnals);
    }

    addToHymnals(newValue: Array<object>){
        this.hymnals = this.hymnals.concat(newValue);
        this.hymnalChange.next(this.hymnals);
    }

    addToHymns(propName: string, newValue:Array<object>) {        
        this.hymns[propName] = newValue;        
        this.hymnChange.next(this.hymns);
    }

    addToBookmarks(newValue: object){
        var dup = this.bookmarks.filter(val => {
            return val['hymnalId'] == newValue['hymnalId'] &&
                val['hymnId'] == newValue['hymnId'];
        })
        if(dup.length <= 0){
            this.bookmarks.push(newValue);
            this.bookmarksChange.next(this.bookmarks);
        }
    }

    addToRecent(newValue: object){
        var index = this.history.findIndex(i => i['hymnalId'] == newValue['hymnalId'] &&
                                    i['hymnId'] == newValue['hymnId']);
        
        if(index >= 0)
            this.history.splice(index);

        this.history.splice(0, 0, newValue);
        if(this.history.length > this.recentCount)
            this.history.splice(this.history.length - 1);

        this.historyChange.next(this.history);
    }

    removeFromBookmarks(hymnalId: string, hymnId: string){
        let index = this.bookmarks.findIndex(i => i['hymnId'] == hymnId && i['hymnalId'] == hymnalId);
        this.bookmarks.splice(index);
        this.bookmarksChange.next(this.bookmarks);
    }

    setActiveHymnal(newValue:string){
        this.activeHymnal = newValue
        this.activeHymnalChange.next(this.activeHymnal);
    }

    setActiveHymn(newValue:string){
        this.activeHymn = newValue
        this.activeHymnChange.next(this.activeHymn);

        let activeHymn = this.activeHymn;
        let curHymn = this.hymns['hymnal' + this.activeHymnal].filter(function(item){
            return item['id'] == activeHymn;
        })[0];

        this.addToRecent({
            'hymnalId': this.activeHymnal,
            'hymnId': this.activeHymn,
            'hymnNumber': curHymn['number'],
            'hymnTitle': curHymn['title'],
            'firstLine': curHymn['firstLine']
        });
    }

    setRecentCount(newValue:number){
        this.recentCount = newValue
        this.historyCountChange.next(this.recentCount);

        var diff = this.history.length - newValue;
        if(diff > 0)
            this.history.splice(this.history.length - diff, diff);

    }

    setPadding(newValue: Number){
        this.padding = newValue;
        this.paddingChange.next(this.padding);
    }

    setActiveAlignment(newValue: string){
        this.activeAlignment = newValue;
        this.activeAlignmentChange.next(this.activeAlignment);
    }

    setFontSize(newValue: number){
        this.fontSize = newValue;
        this.fontSizeChange.next(this.fontSize);
    }

    setFontName(newValue: string){
        this.fontName = newValue;
        this.fontNameChange.next(this.fontName);
    }

    setTheme(newValue: string){
        this.theme = newValue;
        this.themeChange.next(this.theme);
    }

    setSoundFont(newValue: object){
        this.soundfont = newValue;
        this.soundFontChange.next(newValue);
    }

    setShowStanza(newValue: boolean){
        this.showStanza = newValue;
        this.showStanzaChange.next(newValue);
    }

    getHymnalList() : Array<object>{
        return this.hymnals;
    }

    getHymnList() : object{
        return this.hymns;
    }

    getActiveHymnal() : string{
        return this.activeHymnal;
    }

    getActiveHymn() : string{
        return this.activeHymn;
    }

    getRecentCount() : number{
        return this.recentCount;
    }

    getBookmarksList() : Array<object>{
        let activeHymnal = this.activeHymnal
        return this.bookmarks.filter(x => {
            return x['hymnalId'] == activeHymnal;
        });
    }

    getRecentList() : Array<object>{
        let activeHymnal = this.activeHymnal
        return this.history;
    }

    getPadding() : Number{
        return this.padding;
    }

    getActiveAlignment(): string{
        return this.activeAlignment;
    }

    getFontSize() : number{
        return this.fontSize;
    }

    getFontName() : string{
        return this.fontName;
    }

    getTheme() : string{
        return this.theme;
    }

    getHymnals(http: Http){
        let url = "";
        console.log(this.file)
        if(!this.platform.is('cordova'))
            url = '../assets/hymnals/hymnals.json';
        else if(this.platform.is('android'))
            url = this.file.externalRootDirectory + '/MobiHymn/hymnals.json';
        else if(this.platform.is('ios'))
            url = this.file.documentsDirectory + '/MobiHymn/hymnals.json';
        return http.get(url).map(res => res.json());
    }

    getHymns(http: Http, i: number){
        let url = "";
        if(this.platform.is('android'))
            url = this.file.externalRootDirectory + '/MobiHymn/hymnal ' + i + '.json';
        else if(this.platform.is('ios'))
            url = this.file.documentsDirectory + '/MobiHymn/hymnal ' + i + '.json';
        else
            url = '../assets/hymnal ' + i + '.json';
        return http.get(url).map(res => res.json());
    }

    getSoundfonts(){
        let url = "";
        if(this.platform.is('cordova'))
            url = this.file.applicationDirectory + 'www/'
        else
            url = '../';
        url += 'assets/js/soundfonts/acoustic_grand_piano-mp3.js';
        this.ac = new AudioContext();
        return SoundFont.instrument(this.ac, url);
    }

    getShowStanza(){
        return this.showStanza;
    }

    isInBookmark(hymnalId, hymnId){
        return this.bookmarks.findIndex(i => i['hymnalId'] == hymnalId && i['hymnId'] == hymnId) >= 0;
    }
}