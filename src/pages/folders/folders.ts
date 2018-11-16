import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalVars } from '../../services/settings.service';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { File, Entry } from '@ionic-native/file';
import { LoadingController, ToastController } from 'ionic-angular';
import { FilePath } from '@ionic-native/file-path';
import { FileChooser } from '@ionic-native/file-chooser';
import { Db } from '../../services/database.service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
	selector: 'page-folders',
	templateUrl: 'folders.html',
})
export class FoldersPage {

	public colorClassName: string;
	public selectedFile: string = '';
	public listDir: Array<Entry> = [];

	public listFiles: Array<string> = [];
	public searchFile: string;
	public showFiles: boolean = false;
	public fileToParse: any;

	public isParsing: boolean = false
	public progressBar: number = 0

	constructor(public navCtrl: NavController, public navParams: NavParams, public globalVars: GlobalVars, public androidPermissions: AndroidPermissions,
		private file: File, public loadingCtrl: LoadingController, public toastCtrl: ToastController, private filePath: FilePath,
		private fileChooser: FileChooser, public db: Db, public translateService: TranslateService) {
	}

	public presentToast(msg) {
		let toast = this.toastCtrl.create({
			message: msg,
			duration: 5000,
			position: 'top'
		});

		toast.onDidDismiss(() => {
			console.log('Dismissed toast');
		});
		toast.present();
	}

	public searchFiles() {
		this.listFiles = []
		this.listDir.forEach(file => {
			if (file.name.includes(this.searchFile)) {
				this.listFiles.push(file.name)
			}
		})
	}

	public getUri() {
		this.fileChooser.open().then(uri => {
			let fileExtension = uri.substr(uri.lastIndexOf('.') + 1)
			if (fileExtension == 'his') {
				this.selectedFile = uri
			} else {
				this.presentToast('Mauvais format de fichier')
			}
		}).catch(e => this.presentToast('uri: ' + JSON.stringify(e)));
	}

	public async getContentFile(fileName: string) {
		console.log(this.file.dataDirectory + "Documents/", fileName)
		try {
			this.progressBar = 0
			this.isParsing = true
			console.log('START PARSING: ')
			this.file.readAsBinaryString(this.file.dataDirectory + "Documents/", fileName).then(async (data) => {

				// Découpage des données du fichier en ligne
				let data_tmp = data.split('\n')
				// -----------------------------------------

				// Découpage et mise en forme des colonnes
				let arrayColumns = data_tmp[1].split('\t')
				let columns = ["FILENAME"]
				arrayColumns.forEach(column => {
					columns.push(column.replace(/\s/g, ''))
				});
				// ---------------------------------------

				// Création d'un tableau de type VARCHAR par default
				let arrayTypes = []
				for (let n: number = 0; n < columns.length; n++) {
					arrayTypes.push(' VARCHAR(255)')
				}
				this.progressBar = 20
				// -------------------------------------------------

				// Découpage et mise en forme de chaque ligne
				let arrayLines = []
				for (let n = 2; n < data_tmp.length - 1; n++) {
					let values = data_tmp[n].split('\t');
					let line = [];
					line.push('"' + fileName + '"')
					for (let n: number = 0; n < values.length; n++) {
						let regFloat = new RegExp('^[+-]?[0-9]*[.]?[0-9]+$')
						values[n] = values[n].replace(/\s{1,}/g, '')
						if (values[n] == '' || values[n].length < 0) {
							values[n] = 'NULL'
						}
						if (regFloat.test(values[n]) && arrayTypes[n + 1] == ' VARCHAR(255)') {
							arrayTypes[n + 1] = ' FLOAT'
							line.push(values[n])
						} else if (regFloat.test(values[n]) && arrayTypes[n + 1] != ' VARCHAR(255)') {
							line.push(values[n])
						} else if (!regFloat.test(values[n]) && arrayTypes[n + 1] != ' FLOAT' && n != 0) {
							line.push('NULL')
						} else {
							line.push('"' + values[n] + '"')
						}
					}
					arrayLines.push(line)
				}
				// -------------------------------------------

				// Vérification du nombre de valeurs par lignes
				console.log('Nombre de colonnes du fichier: ', columns.length)
				let tabIsOk = true
				arrayLines.forEach(lines => {
					if (lines.length != columns.length) {
						tabIsOk = false
						console.log("ERREUR: Une ou plusieurs lignes ne correspondent pas aux nombres de colonnes attendu")
					}
				});
				// -------------------------------------------

				if (tabIsOk) {
					console.log("Le tableau est conforme, début de l'insertion des données ...")
					// Création de la table si elle n'existe pas 
					let columnsAndTypes: string = ''
					let columnsInsertData: string = ''
					for (let n: number = 0; n < columns.length; n++) {
						if (n + 1 < columns.length) {
							columnsAndTypes += columns[n] + ' VARCHAR(255), '
							columnsInsertData += columns[n] + ', '
						}
						else {
							columnsAndTypes += columns[n] + ' VARCHAR(255)'
							columnsInsertData += columns[n]
						}
					}
					this.progressBar = 31
					await this.db.createTable("meteo", columnsAndTypes)
					// -----------------------------------------

					// On vérifie si un fichier du même nom est déjà parsé
					this.progressBar = 49
					let isAlreadyParse = await this.db.findDataParse('meteo', fileName)
					console.log('DOCUMENT DEJA PARSE: ', isAlreadyParse)
					// ---------------------------------------------------

					if (!isAlreadyParse) {
						// Ajout des données en un bloc 
						let lines: string = ''
						for (let n: number = 0; n < arrayLines.length; n++) {
							if (n + 1 < arrayLines.length)
								lines += '(' + arrayLines[n].toString() + '), '
							else
								lines += '(' + arrayLines[n].toString() + ') '
						}
						this.progressBar = 78
						await this.db.insertData("meteo", columnsInsertData, lines)
						this.presentToast('Fichier parsé avec succès')
						this.isParsing = false
						// -----------------------------------------
					} else {
						this.presentToast('Un fichier du même nom à déjà été parsé!')
						this.isParsing = false
					}	
				} else {
					this.isParsing = false
				}
			})
		} catch (err) {
			console.log(err)
		}
	}

	public listDataDir() {
		this.listFiles = []
		if (this.showFiles) {
			this.showFiles = false
		} else {
			this.showFiles = true
		}
		this.file.listDir(this.file.dataDirectory + 'Documents/', '').then(res => {
			this.listDir = res;
			res.forEach(file => {
				this.listFiles.push(file.name);
			});
		}).catch(err => this.presentToast('List dir err: ' + err))
	}

	public uploadFile() {
		const url = this.selectedFile;
		if (url != null && url != undefined && url != '') {
			console.log(url)
			this.filePath.resolveNativePath(url).then(file_path => {
				const file_name = file_path.substr(file_path.lastIndexOf('/') + 1);
				const abs_file_path = file_path.substring(0, file_path.length - file_name.length);
				this.file.copyFile(abs_file_path, file_name, this.file.dataDirectory + 'Documents/', file_name).then(_ => {
					this.presentToast('File copied success')
					this.listDataDir()
					this.showFiles = true
					// this.navCtrl.setRoot(this.navCtrl.getActive().component);
				}).catch(err => this.presentToast('Not copy: ' + err.message));
			}).catch(err => this.presentToast('File path error: ' + err.message));
		} else {
			this.presentToast('Aucun fichier séléctionné')
		}
	}

	public removeFile(fileName: string) {
		this.file.checkFile(this.file.dataDirectory + 'Documents/', fileName).then(bool => {
			if (bool == true) {
				this.file.removeFile(this.file.dataDirectory + 'Documents/', fileName).then(_ => {
					this.presentToast('File removed')
					this.listDataDir()
					this.showFiles = true
				}).catch(err => console.log('Remove file err: ' + err.message))
			}
		}).catch(err => this.presentToast('Check File err: ' + err.message + ' -> ' + fileName))
	}

	ionViewWillEnter() {
		if (this.colorClassName != this.globalVars.getColorValue()) {
			this.colorClassName = this.globalVars.getColorValue();
		}
	}

	async ionViewDidLoad() {
		let db = this.db
		let globalVars = this.globalVars
		let translateService = this.translateService
		setTimeout(async function () {
			await db.createDB()
			let settings = await db.getData('settings', 'language, color')
			console.log('SETTINGS: ', JSON.stringify(settings))
			if (settings.data != null) {
				globalVars.setColorValue('color-template-' + settings.data.color);
				translateService.use(settings.data.language)
				this.colorClassName = await globalVars.getColorValue();
			}
		}, 175);
	}

}
