import { Component, ViewChild } from '@angular/core';
import { Slides, Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';

/**
 * Generated class for the IntroSliderComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'intro-slider',
  templateUrl: 'intro-slider.html'
})
export class IntroSliderComponent {
  slideList: Array<Object>;

  @ViewChild(Slides) slides: Slides;

  constructor(private platform: Platform, private file: File) {
    //if(window.localStorage.getItem('introSlider')){}
    platform.ready().then(() => {
      let intro = window.localStorage.getItem('intro');
      if(intro)
        this.exitSlides();
      else
        window.localStorage.setItem('intro', 'true');

      let url = platform.is('cordova') ? (file.applicationDirectory + 'www/') : '../';
      let ios = platform.is('ios');
  
      if(ios){
        this.slideList = [{
          icon: [url + "assets/images/logo/Icon-72@2x.png"],
          iconType: "img",
          title: "Welcome to MobiHymn"
        },{
          icon: [url + "assets/images/intro/mobihymn-lib-ios.png"],
          iconType: "img",
          class: "cropped",
          title: "Browse",
          description: "Browse through all the hymnals you desire to read"
        },{
          icon: [url + "assets/images/intro/mobihymn-reader-ios.png"],
          iconType: "img",
          class: "cropped",
          title: "Read and Play",
          description: "MobiHymn lets you read a hymn's lyrics and play it in a chosen hymnal"
        },{
          icon: [url + "assets/images/intro/mobihymn-reader-edit-ios.png"],
          iconType: "img",
          class: "cropped",
          title: "Customize",
          description: "Customize reading page to your satisfaction"
        },{
          icon: ["checkmark-circle-outline"],
          iconType: "ion",
          title: "Start reading"
        }];
      }
      else{
        this.slideList = [{
          icon: [url + "assets/images/logo/Icon-72@2x.png"],
          iconType: "img",
          title: "Welcome to MobiHymn"
        },{
          icon: [url + "assets/images/intro/mobihymn-lib-android.png"],
          iconType: "img",
          class: "cropped",
          title: "Browse",
          description: "Browse through all the hymnals you desire to read"
        },{
          icon: [url + "assets/images/intro/mobihymn-reader-android.png"],
          iconType: "img",
          class: "cropped",
          title: "Read and Play",
          description: "MobiHymn lets you read a hymn's lyrics and play it in a chosen hymnal"
        },{
          icon: [url + "assets/images/intro/mobihymn-reader-edit-android.png"],
          iconType: "img",
          class: "cropped",
          title: "Customize",
          description: "Customize reading page to your satisfaction"
        },{
          icon: ["checkmark-circle-outline"],
          iconType: "ion",
          title: "Start reading"
        }];
      }
    })
  }

  exitSlides(){
    this.slides._elementRef.nativeElement.parentElement.style.display = "none";
    //window.localStorage.setItem('introSlider', 'done');
  }

}
