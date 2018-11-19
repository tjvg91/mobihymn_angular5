import { Component, ViewChild } from '@angular/core';
import { Slides, Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';

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
      let intro = window.localStorage.getItem('intro2');
      window.localStorage.removeItem('intro');
      if(intro)
        this.exitSlides();
      else
        window.localStorage.setItem('intro2', 'true');
      let url = platform.is('cordova') ? (file.applicationDirectory + 'www/') : '../';
      let ios = platform.is('ios');

      if(ios){
        this.slideList = [{
          icon: ["assets/images/logo/logo.png"],
          iconType: "img",
          title: "Welcome to MobiHymn"
        },{
          icon: ["assets/images/intro/mobihymn-lib-ios.png"],
          iconType: "img",
          class: "cropped",
          title: "Browse",
          description: "Browse through all the hymnals you desire to read"
        },{
          icon: ["assets/images/intro/mobihymn-hymns-ios.png"],
          iconType: "img",
          class: "cropped",
          title: "Browse",
          description: "Browse through all the hymns in your desired hymnal"
        },{
          icon: ["assets/images/intro/mobihymn-reader-ios.png"],
          iconType: "img",
          class: "cropped",
          title: "Read and Play",
          description: "MobiHymn lets you read a hymn's lyrics and play it in a chosen hymnal"
        },{
          icon: ["assets/images/intro/mobihymn-edit-ios.png"],
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
          icon: ["assets/images/logo/logo.png"],
          iconType: "img",
          title: "Welcome to MobiHymn"
        },{
          icon: ["assets/images/intro/mobihymn-lib-android.png"],
          iconType: "img",
          class: "cropped",
          title: "Browse",
          description: "Browse through all the hymnals you desire to read"
        },{
          icon: ["assets/images/intro/mobihymn-hymns-android.png"],
          iconType: "img",
          class: "cropped",
          title: "Browse",
          description: "Browse through all the hymns in your desired hymnal"
        },{
          icon: ["assets/images/intro/mobihymn-reader-android.png"],
          iconType: "img",
          class: "cropped",
          title: "Read and Play",
          description: "MobiHymn lets you read a hymn's lyrics and play it in a chosen hymnal"
        },{
          icon: ["assets/images/intro/mobihymn-edit-android.png"],
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
