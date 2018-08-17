import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import * as Firebase from 'firebase';

import 'rxjs/Rx';
import { DateTime } from 'ionic-angular';

@Injectable()
export class UserService {
    _displayName: string;
    _email: string;
    _photoURL: string;
    _emailVerified: boolean;
    _uid: string;
    _creationTime: Date;
    _lastSignInTime: Date;
    _gender: string;

    public get displayName() : string {
        return this._displayName
    }
    
    public get email() : string {
        return this._email;
    }    
    
    public get photoURL() : string {
        return this._photoURL
    }
    
    public get emailVerified() : boolean {
        return this._emailVerified
    }
    
    public get uid() : string {
        return this._uid;
    }
    
    public get creationTime() : Date {
        return this._creationTime;
    }
    
    public get lastSignInTime() : Date {
        return this._lastSignInTime;
    }        
    
    public get gender() : string {
        return this._gender;
    }
       
    
    
    public set displayName(v : string) {
        this._displayName = v;
    }    
    
    public set email(v : string) {
        this._email = v;
    }
    
    public set photoURL(v : string) {
        this._photoURL = v;
    }
    
    public set emailVerified(v : boolean) {
        this._emailVerified = v;
    }
    
    public set uid(v : string) {
        this._uid = v;
    }
    
    public set creationTime(v : Date) {
        this._creationTime = v;
    }
    
    public set lastSignInTime(v : Date) {
        this._lastSignInTime = v;
    }
    
    public set gender(v : string) {
        this._gender = v;
    }
    
    public toJSON(){
        return{
            displayName: this._displayName,
            email: this._email,
            photoURL: this._photoURL,
            emailVerified: this._emailVerified,
            uid: this._uid,
            creationTime: this._creationTime,
            lastSignInTime: this._lastSignInTime,
            gender: this._gender
        }
    }
}