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
	public selectedFile: string;
	public listFileParse: Array<object> = [
		{
			"name": "test1",
			"values": "test1"
		},
		{
			"name": "test2",
			"values": "test2"
		},
	];

	public selectedColumn: Array<string>;
	public listColumns: Array<object> = [
		{
			"name": "col1",
			"values": "col1"
		},
		{
			"name": "col2",
			"values": "col2"
		},
		{
			"name": "col3",
			"values": "col3"
		},
		{
			"name": "col4",
			"values": "col4"
		},
	];

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
