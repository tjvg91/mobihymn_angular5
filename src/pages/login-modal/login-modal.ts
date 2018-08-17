import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, DateTime } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';
import { UserService } from '../../services/user-service';
import * as Firebase from 'firebase';

/**
 * Generated class for the LoginModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html',
})
export class LoginModalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private global: GlobalService, private viewCtrl: ViewController,
            private user: UserService) {

  }

  ionViewDidLoad() {
    
  }

  signInGMail(){
    this.global.firebaseAuth.signInWithPopup(this.global.firebaseAuthGmailProvider)
    .then(function(user){
      console.log(user);
    }).catch(function(err){
      alert(err.message)
    })
  }

  signInFB(){
    let login = this;
    this.global.firebaseAuth.signInWithPopup(this.global.firebaseAuthGmailProvider)
    .then(function(u){
      console.log(u);
      login.user.displayName = u['user']["displayName"];
      login.user.email = u['user']["email"];
      login.user.photoURL = u['user']["photoURL"];
      login.user.uid = u['user']["uid"];
      login.user.creationTime = new Date(u['user']['metaData']["creationTime"]);
      login.user.lastSignInTime = new Date(u['user']['metaData']["lastSignInTime"]);
      login.user.gender = u['additionalUserInfo']['gender'];
      login.global.isAuthenticated = true;
      login.dismiss();
      login.global.firebaseCollection.collection("Users").doc(login.user.uid).set(login.user.toJSON());
    }).catch(function(err){
      alert(err.message)
    })
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }
}
