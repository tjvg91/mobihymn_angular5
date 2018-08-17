import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global-service';

import * as MidiPlayer from 'midi-player-js';
import * as SoundFont from 'soundfont-player';

/**
 * Generated class for the MidiPopoverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-midi-popover',
  templateUrl: 'midi-popover.html',
})
export class MidiPopoverPage {
  params: any;
  reader: any;
  player: MidiPlayer.Player;
  global: GlobalService;
  curHymnal: string;
  curHymn: string;

  minTempo: any;
  maxTempo: any;
  valTempo: any;
  tracks: Array<Object> = [{
    number: 2,
    mute: false
  },{
    number: 3,
    mute: false
  },{
    number: 4,
    mute: false
  }]

  curInstru: any = "acoustic_grand_piano-mp3";
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.params = navParams;
    this.reader = this.params.get('reader');
  }

  ionViewDidLoad() {
    this.player = this.reader.mdiPlayer;
    console.log(this.player);
    this.valTempo = this.player['tempo'];
    this.minTempo = 60;
    this.maxTempo = 120;
    for(let i = 0; i < this.tracks.length; i++){
      this.tracks[i]["mute"] = !this.player.tracks.filter(x =>{
        return x["index"] - 1 == i;
      })[0]["enabled"];
    }
    this.global = this.reader["myGlobal"];
    this.curHymnal = this.reader["activeHymnal"];
    this.curHymn = this.reader["currentHymn"]["id"];
  }

  tempoChange(){
    var isPlaying = this.player.isPlaying();
    this.player.pause();
    this.player['tempo'] = this.valTempo;
    this.reader["mdiLength"] = parseInt(this.reader.mdiPlayer.getSongTime());
    if(isPlaying)
      this.player.play();
    if(!this.global.hymnSettings)
      this.global.hymnSettings = {};
    if(!this.global.hymnSettings[this.curHymnal])
      this.global.hymnSettings[this.curHymnal] = {};
    if(!this.global.hymnSettings[this.curHymnal][this.curHymn])
      this.global.hymnSettings[this.curHymnal][this.curHymn] = {}
    this.global.hymnSettings[this.curHymnal][this.curHymn]["tempo"] = this.valTempo;
  }

  trackChange(track, ev){
    track["mute"] = !track["mute"];
    this.reader.mdiPlayer.tracks.filter(x => {
      return x["index"] == track["number"] - 1;
    })[0].enabled = !track["mute"];
  }
}
