import { Component, Input, Output, EventEmitter } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';

/**
 * Generated class for the KeyboardComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'keyboard',
  templateUrl: 'keyboard.html',
  animations: [
    trigger('slideUp', [
      state('hidden', style({
        bottom: '-12em'
      })),
      state('shown', style({
        bottom: '0em'
      })),
      transition('hidden <=> shown', animate('500ms ease'))
    ])
  ]
})
export class KeyboardComponent{
  @Output() outputChange = new EventEmitter();

  keyboardShown: string = "hidden";

  @Input('keyboardView')
  set keyboardView(value : string){
    this.keyboardShown = value;
  }

  get keyboardView(){
    return this.keyboardShown;
  }

  key: string = "";
  tune: string = "";
  append: boolean = false;
  
  constructor() {
  }

  public hideKeyboard() : void{
    this.keyboardView = "hidden";
  }

  public showKeyboard() : void{
    this.keyboardView = "shown";
  }

  public isHidden() : boolean{
    return this.keyboardView == "hidden";
  }

  public isShown() : boolean{
    return this.keyboardView == "shown";
  }
  
  keyChange(key){
    let go = false;
    if(!parseInt(key)){
      if(/f|s|t/.test(key))
        this.tune = key;
      else if(key == 'b'){
        if(this.tune)
          this.tune = ""
        else if(this.key.length == 1){
          this.key = "1"
          this.append = false;
        }
        else
          this.key = this.key.substr(0, this.key.length - 1);        
      }
      else if(key == 'e'){
        go = true;
      }
    }
    else{
      if(this.append)
        this.key += key;
      else{
        this.key = key;
        this.append = true;
      }
    }

    this.outputChange.emit({
      outs: this.key,
      tune: this.tune,
      go: go
    });
  }
}
