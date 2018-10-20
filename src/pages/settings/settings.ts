import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVars } from '../../services/settings.service'
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public colorClassName: string;

  public settings: any = {
    'language': '',
    'color': ''
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars, public translateService: TranslateService) {

  }

  settingsForm() {
    if (this.settings.language != null && this.settings.language != "") {
      this.translateService.use(this.settings.language)
    }
    
    if (this.settings.color != null && this.settings.color != "") {
      this.globalVars.setColorValue('color-template-' + this.settings.color);
      this.colorClassName = this.globalVars.getColorValue();
    } else {
      localStorage.removeItem('color');
    }
    
    this.settings.language = '';
    this.settings.color = '';
  }

  ionViewWillEnter() {
    if (this.colorClassName != this.globalVars.getColorValue()) {
      this.colorClassName = this.globalVars.getColorValue();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }
}
