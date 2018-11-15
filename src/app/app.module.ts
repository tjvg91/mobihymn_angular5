import { NgModule, ErrorHandler, Injectable, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Pro } from "@ionic/pro";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faFont } from '@fortawesome/free-solid-svg-icons';

import { TabsPage } from '../pages/tabs/tabs';
import { ReaderPage } from '../pages/reader/reader';
import { HomePage } from '../pages/home/home';
import { SearchPage } from '../pages/search/search';
import { SettingsPage } from '../pages/settings/settings';

import { InputModalPage } from '../pages/input-modal/input-modal';
import { LoginModalPage } from '../pages/login-modal/login-modal';
import { MidiPopoverPage } from '../pages/midi-popover/midi-popover';
import { SettingsPopoverPage } from '../pages/settings-popover/settings-popover';
import { SettingsPopoverItemsPage } from '../pages/settings-popover-items/settings-popover-items';
import { SettingsPopoverListPage } from '../pages/settings-popover-list/settings-popover-list';
import { TunePopoverPage } from '../pages/tune-popover/tune-popover';
import { AuthorModalPage } from '../pages/author-modal/author-modal';
import { RevisionsModalPage } from '../pages/revisions-modal/revisions-modal';
import { AboutPage } from '../pages/about/about';
import { ImageMakerPage } from '../pages/image-maker/image-maker';
import { IntroSliderComponent } from '../components/intro-slider/intro-slider';
import { HymnalInfoPage } from '../pages/hymnal-info/hymnal-info';
import { SearchModalPage } from '../pages/search-modal/search-modal'

import { GlobalService } from '../services/global-service';
import { UserService } from '../services/user-service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Insomnia } from '@ionic-native/insomnia';
import { Network } from '@ionic-native/network';
import { SpeechRecognition } from "@ionic-native/speech-recognition";

Pro.init('91b67970', {
  appVersion: '0.8.2'
});

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}

library.add(faSpinner, faFont);

@NgModule({
  declarations: [
    MyApp,
    ReaderPage,
    HomePage,
    InputModalPage,
    LoginModalPage,
    MidiPopoverPage,
    SearchPage,
    SettingsPage,
    SettingsPopoverPage,
    SettingsPopoverItemsPage,
    SettingsPopoverListPage,
    TunePopoverPage,
    AuthorModalPage,
    RevisionsModalPage,
    AboutPage,
    ImageMakerPage,
    IntroSliderComponent,
    HymnalInfoPage,
    SearchModalPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    FontAwesomeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ReaderPage,
    HomePage,
    SearchPage,
    SettingsPage,
    InputModalPage,
    LoginModalPage,
    MidiPopoverPage,
    SettingsPopoverPage,
    SettingsPopoverListPage,
    SettingsPopoverItemsPage,
    AuthorModalPage,
    RevisionsModalPage,
    AboutPage,
    ImageMakerPage,
    TunePopoverPage,
    IntroSliderComponent,
    HymnalInfoPage,
    SearchModalPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GlobalService,
    UserService,
    File,
    FileTransfer,
    Insomnia,
    Network,
    SpeechRecognition,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {}
