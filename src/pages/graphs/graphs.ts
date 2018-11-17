import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVars } from '../../services/settings.service'
import { Db } from '../../services/database.service';

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
	public listFileParse: Array<string> = [];

	public selectedColumns: Array<string> = [];
	public listColumns: Array<string> = [];

	public analysed: boolean = false;
	public analysedData: Array<any> = [];

	constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars, public db: Db) {}

	ionViewWillEnter() {
		if (this.colorClassName != this.globalVars.getColorValue()) {
			this.colorClassName = this.globalVars.getColorValue();
		}
		this.db.checkIfTableExist('meteo').then(async (res) => {
			let tableIsNotEmpty = res;
			if (tableIsNotEmpty) {
				this.db.getFilesName('meteo').then((res) => {
					this.listFileParse = res;
				})
				this.db.getColumnsTable('meteo').then((res) => {
					this.listColumns = res;
				})
			}

		})
	}

	public analyse() {
		this.analysedData = [];
		if (this.selectedColumns && this.selectedColumns.length > 0) {
			this.selectedColumns.forEach(async (column) => {
				await this.db.analyseColumn(column).then((res) => {
					if (res && res.length > 0 && res != '') {
						console.log(res);
						let data = JSON.parse(res)
						let moy = data.moyenne.toFixed(2);
						this.analysedData.push({
							'analyse': column,
							'min': data.min,
							'dMin': data.dMin,
							'moyenne': moy,
							'max': data.max,
							'dMax': data.dMax
						})
					} else {
						console.log('Erreur lors du traitement de la colonne ..');
					}
				})
			});
		}
		this.analysed = true;
	}

	public reinitialise() {
		this.analysed = false;
		this.selectedFile = '';
		this.selectedColumns = [];
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraphsPage');
	}

}
