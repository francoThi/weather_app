import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVars } from '../../services/settings.service'

/**
 * Generated class for the GraphsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-graphs',
	templateUrl: 'graphs.html',
})
export class GraphsPage {

	public colorClassName: string;

	constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars) {
	}

	ionViewWillEnter() {
		if (this.colorClassName != this.globalVars.getColorValue()) {
			this.colorClassName = this.globalVars.getColorValue();
		}
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraphsPage');
	}

}
