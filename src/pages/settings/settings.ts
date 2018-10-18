import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public colorClassName: string = '';

  public settings: any = {
    'language': '',
    'color': ''
  };

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  settingsForm() {
    if (this.settings.language != null && this.settings.language != "") {
      localStorage.setItem('language', this.settings.language);
    } else {
      localStorage.removeItem('language');
    }
    
    if (this.settings.color != null && this.settings.color != "") {
      localStorage.setItem('color', this.settings.color);
      this.colorClassName = 'color-template-' + this.settings.color;
    } else {
      localStorage.removeItem('color');
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

}
