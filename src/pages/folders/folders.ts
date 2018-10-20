import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVars } from '../../services/settings.service';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@IonicPage()
@Component({
  selector: 'page-folders',
  templateUrl: 'folders.html',
})
export class FoldersPage {

  public colorClassName: string;
  public selectedFile: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars, public androidPermissions: AndroidPermissions) {
  }

  ionViewWillEnter() {
    if (this.colorClassName != this.globalVars.getColorValue()) {
      this.colorClassName = this.globalVars.getColorValue();
    }
  }

  public test() {
    console.log('DEBUG');
    console.log(this.selectedFile);
  }

  ionViewDidLoad() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(result => 
      console.log('Has permission?',result.hasPermission), err => 
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
    );
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.INTERNET).then(result => 
      console.log('Has permission?',result.hasPermission), err => 
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.INTERNET)
    );
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(result => 
      console.log('Has permission?',result.hasPermission), err => 
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
    );
    
    this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.INTERNET,
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    ]);
  }

}
