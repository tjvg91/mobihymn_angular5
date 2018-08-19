import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

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
import { GlobalService } from '../services/global-service';
import { UserService } from '../services/user-service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Insomnia } from '@ionic-native/insomnia';
import { Network } from '@ionic-native/network';

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
    TabsPage
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp)
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
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
