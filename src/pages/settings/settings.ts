import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVars } from '../../services/settings.service'
import { TranslateService } from '@ngx-translate/core';
import { Db } from '../../services/database.service';

@IonicPage()
@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html',
})
export class SettingsPage {

	public colorClassName: string;

	public settings = {
		'language': '',
		'color': ''
	};

	constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars, public translateService: TranslateService,
		public db: Db) {

	}

	async settingsForm() {
		let queryUpdate = '';
		if (this.settings.language != null && this.settings.language != "") {
			this.translateService.use(this.settings.language)
			queryUpdate += 'language = "' + this.settings.language + '" '
		}

		if (this.settings.color != null && this.settings.color != "") {
			this.globalVars.setColorValue('color-template-' + this.settings.color);
			this.colorClassName = this.globalVars.getColorValue();
			if (queryUpdate != '') {
				queryUpdate += ', color = "' + this.settings.color + '" '
			} else {
				queryUpdate += 'color = "' + this.settings.color + '" '
			}
		}

		let set = await this.db.getData('settings', 'language, color')
		console.log('SETTINGS: ', JSON.stringify(set))
		if (set['data'] != null) {
			await this.db.updateData('settings', queryUpdate, ' 1 = 1')
		} else if (set == null) {
			console.log('Une erreur est survenue!')
		} else {
			if (this.settings.language == null || this.settings.language == "") {
				this.settings.language = 'fr'
			}
			if (this.settings.color == null || this.settings.color == "") {
				this.settings.color = 'white'
			}
			await this.db.insertData('settings', 'language, color', '("'+this.settings.language+'", "'+this.settings.color+'")')
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
