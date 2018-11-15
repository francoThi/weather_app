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
			this.selectedFile = uri
		}).catch(e => this.presentToast('uri: ' + JSON.stringify(e)));
	}

	public getContentFile(fileName: string) {
		console.log(this.file.dataDirectory + "Documents/", fileName)
		try {
			this.file.readAsBinaryString(this.file.dataDirectory + "Documents/", fileName).then( async (data) => {
				console.log('START PARSING: ')
				let file = data.replace(/\t/g, ",");
				file = file.replace(/,( ,)/g, ", NULL,");
				file = file.replace(/,( ,)/g, ", NULL,");
				file = file.replace(/,,/g, ", NULL,");
				file = file.replace(/\n/g, ";");
				let lines = file.split(";")
				console.log(lines[1])
				let arrayColumns = lines[1].split(',')

				let columns = 'fileName VARCHAR(255), '

				let posDate: number
				let posLightningRfNoise: number
				let posPresentWeather: number
				for (let l: number = 0; l < arrayColumns.length; l++) {
					if (arrayColumns[l] == 'CREATEDATE') {
						columns += (arrayColumns[l] + ' DATE, ')
						posDate = l
					} else if (arrayColumns[l] == 'LIGHTNING_RF_NOISE'){
						columns += (arrayColumns[l] + ' VARCHAR(255), ')
						posLightningRfNoise = l
					} else if (arrayColumns[l] == 'PRESENT_WEATHER') {
						columns += (arrayColumns[l] + ' VARCHAR(255), ')
						posPresentWeather = l
					} else {
						columns += (arrayColumns[l] + ' INT, ')
					}
				}
				columns = columns.substring(0, columns.length - 2)
				console.log('Colonnes: ', columns)

				let values = ''
				for (let l: number = 2; l < lines.length - 1; l++) {
				// for (let l: number = 7572; l < 7595; l++) {
					let arrayLines = lines[l].split(',')
					let lines_tmp = ''
					for (let n: number = 0; n < arrayLines.length; n++) {
						if (n == posDate || n == posLightningRfNoise || n == posPresentWeather) {
							lines_tmp += '"'+arrayLines[n]+'",'
						} else {
							lines_tmp += arrayLines[n] + ','
						}
					}
					lines_tmp = lines_tmp.substring(0, lines_tmp.length - 1)
					if (lines_tmp[lines_tmp.length -3] == ',') {
						lines_tmp = lines_tmp.substring(0, lines_tmp.length - 3)
						lines_tmp += ', NULL'
					}
					values += '("'+fileName+'", '+lines_tmp+'), '
				}

				values = values.substring(0, values.length - 2)
				// console.log('Values: ', values)
				await this.db.createTable('meteo', columns)
				await this.db.insertData('meteo','fileName,'+ lines[1], values)
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
		await this.db.createDB()
		let settings = await this.db.getData('settings', 'language, color')
		console.log('SETTINGS: ', JSON.stringify(settings))
		if (settings.data != null) {
			this.globalVars.setColorValue('color-template-' + settings.data.color);
			this.translateService.use(settings.data.language)
			this.colorClassName = this.globalVars.getColorValue();
		}
	}

}

// this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(result => 
//   console.log('Has permission?',result.hasPermission), err => 
//   this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
// );
// this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.INTERNET).then(result => 
//   console.log('Has permission?',result.hasPermission), err => 
//   this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.INTERNET)
// );
// this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(result => 
//   console.log('Has permission?',result.hasPermission), err => 
//   this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
// );

// this.androidPermissions.requestPermissions([
//   this.androidPermissions.PERMISSION.INTERNET,
//   this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
//   this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
// ]);