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

	public modeGraph: boolean = false;

	public colorClassName: string;
	public height: number;

	public selectedFile: string;
	public listFileParse: Array<string> = [];

	public selectedColumns: Array<string> = [];
	public listColumns: Array<string> = [];

	public analysed: boolean = false;
	public analysedData: Array<Object> = [];

	public selectedGraph: string;
	public listGraphs: Array<string> = ["Average by hour", "Full data graphic"]

	public columnsUnit: Array<Object> = [
		{ "name": "AIR_TEMPERATURE", "unite": '°' },
		{ "name": "REL_HUMIDITY", "unite": '%' },
		{ "name": "AIR_PRESSURE", "unite": ' hPa' },
		{ "name": "LOCAL_WS_2MIN_MNM", "unite": ' nd' }
	];


	constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars, public db: Db) { }

	ionViewWillEnter() {
		if (this.colorClassName != this.globalVars.getColorValue()) {
			this.colorClassName = this.globalVars.getColorValue();
		}
		this.db.checkIfTableExist('meteo').then(async (res) => {
			let tableIsNotEmpty = res;
			console.log(tableIsNotEmpty)
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
						let data = JSON.parse(res);
						let moy = data.moyenne.toFixed(2);
						for (var i = 0; i < this.columnsUnit.length; i++) {
							if (this.columnsUnit[i]['name'] == column) {
								data.min = data.min + this.columnsUnit[i]['unite'];
								moy = moy + this.columnsUnit[i]['unite'];
								data.max = data.max + this.columnsUnit[i]['unite'];
							}
						}
						if (column == 'LOCAL_WS_2MIN_MNM') {
							let moyWD = data.moyenneWD.toFixed(2);
							data.min = data.min + ' (' + data.minWD + '°)';
							moy = moy + ' (' + moyWD + '°)';
							data.max = data.max + ' (' + data.maxWD + '°)';
						}
						this.analysedData.push({
							'analyse': column,
							'min': data.min,
							'dMin': data.dMin,
							'moyenne': moy,
							'max': data.max,
							'dMax': data.dMax
						})
					} else {
						console.log('Erreur lors du traitement de la colonne ' + column);
					}
				})
			});
		}
		this.height = 75 + (60 * this.selectedColumns.length)
		this.analysed = true;
	}

	public reinitialise() {
		this.analysed = false;
		this.selectedFile = '';
		this.selectedColumns = [];
		this.selectedGraph = '';
		this.height = 0;
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraphsPage');
	}

}
