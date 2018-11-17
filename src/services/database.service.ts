import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Injectable } from '@angular/core';

@Injectable()
export class Db {

	constructor(private sqlite: SQLite) { }

	public db: SQLiteObject

	public createDB() {
		return new Promise<any>(async (resolve, reject) => {
			try {
				this.sqlite.create({
					name: 'meteo.db',
					location: 'default'
				}).then(async (db: SQLiteObject) => {
					console.log('Création/Ouverture de la base avec succès')
					this.db = db
					await this.createTable('settings', 'language VARCHAR(255), color VARCHAR(255)')
					// await this.dropTable('meteo')
					resolve('ok')
				})
			} catch (err) {
				console.log(err)
				reject(err)
			}
		})
	}

	public createTable(tableName: string, columns: string) {
		return new Promise<any>(async (resolve, reject) => {
			if (this.db != null) {
				console.log('CREATE TABLE ' + tableName + ' (' + columns + ')')
				this.db.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + columns + ')', [])
					.then(() => {
						console.log('Executed SQL: Création de la table ' + tableName)
						resolve('ok')
					})
					.catch(err => {
						console.log('ERR CREATE TABLE ', JSON.stringify(err))
						reject('erreur')
					})
			} else {
				console.log('ERROR: La base de donnée est null')
			}
		})
	}

	public checkIfTableExist(tableName: string): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			if (this.db != null) {
				this.db.executeSql('SELECT name FROM sqlite_master WHERE type="table" AND name="' + tableName + '"', [])
					.then(res => {
						resolve(res.rows.length)
					})
					.catch(err => {
						console.log('ERREUR CHECK IF TABLE EXISTE ', JSON.stringify(err))
						reject(0)
					})
			} else {
				console.log('ERREUR: La base de donnée est null')
				reject(0)
			}
		})
	}

	public getFilesName(tableName: string): Promise<Array<string>> {
		return new Promise<Array<string>>(async (resolve, reject) => {
			if (this.db != null) {
				this.db.executeSql('SELECT DISTINCT(FILENAME) FROM (' + tableName + ')', [])
					.then(res => {
						let arrayFilesName: Array<string> = [];
						let filename_tmp = '';
						for (let n: number = 0; res.rows.item(n) && res.rows.item(n) != null; n++) {
							filename_tmp = JSON.stringify(res.rows.item(n)["FILENAME"]);
							filename_tmp = filename_tmp.replace(/"/g, '')
							arrayFilesName.push(filename_tmp)
						}
						resolve(arrayFilesName)
					})
					.catch(err => {
						console.log('ERREUR GET FILENAME: ', JSON.stringify(err))
						reject([])
					})
			} else {
				console.log('ERREUR: La base de donnée est null')
				reject([])
			}
		})
	}

	public getColumnsTable(tableName: string): Promise<Array<string>> {
		return new Promise<Array<string>>(async (resolve, reject) => {
			if (this.db != null) {
				this.db.executeSql('PRAGMA table_info(' + tableName + ')', [])
					.then(res => {
						let arrayColumns: Array<string> = [];
						let column_tmp = '';
						for (let n: number = 0; res.rows.item(n) && res.rows.item(n) != null; n++) {
							column_tmp = JSON.stringify(res.rows.item(n).name);
							if (JSON.stringify(res.rows.item(n).type) == '"FLOAT"') {
								column_tmp = column_tmp.replace(/"/g, '')
								arrayColumns.push(column_tmp)
							}
						}
						resolve(arrayColumns)
					})
					.catch(err => {
						console.log('ERREUR GET COLUMNS TABLE: ', JSON.stringify(err))
						reject([])
					})
			} else {
				console.log('ERREUR: La base de donnée est null')
				reject([])
			}
		})
	}

	public analyseColumn(column: string): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			if (this.db != null) {
				let query = 'SELECT '
				query += '(SELECT MIN('+column+') FROM meteo WHERE '+column+' != "NULL") AS min,';
				query += '(SELECT CREATEDATE FROM meteo WHERE '+column+' = (SELECT MIN('+column+') FROM meteo WHERE '+column+' != "NULL")) AS dMin,';
				query += '(SELECT AVG('+column+') FROM meteo WHERE '+column+' != "NULL" AND '+column+' IS NOT NULL) AS moyenne,';
				query += '(SELECT MAX('+column+') FROM meteo WHERE '+column+' != "NULL") AS max,';
				query += '(SELECT CREATEDATE FROM meteo WHERE '+column+' = (SELECT MAX('+column+') FROM meteo WHERE '+column+' != "NULL")) AS dMax';
				console.log(query)
				this.db.executeSql(query, [])
					.then(res => {
						if (res.rows.length > 0) {
							resolve(JSON.stringify(res.rows.item(0)))
						} else {
							resolve('')
						}
					})
					.catch(err => {
						console.log('ERREUR GET ANALYSE ', JSON.stringify(err))
						reject('')
					})
			} else {
				console.log('ERREUR: La base de donnée est null')
				reject('')
			}
		})
	}

	public getData(tableName: string, columns: string) {
		return new Promise<any>(async (resolve, reject) => {
			if (this.db != null) {
				this.db.executeSql('SELECT ' + columns + ' FROM ' + tableName, [])
					.then(res => {
						resolve({ 'data': res.rows.item(0), 'erreur': '' })
					})
					.catch(err => {
						console.log('ERREUR GET COLUMNS ', JSON.stringify(err))
						reject({ 'data': '', 'erreur': JSON.stringify(err) })
					})
			} else {
				console.log('ERREUR: La base de donnée est null')
				reject({ 'data': '', 'erreur': 'ERREUR: La base de donnée est null' })
			}
		})
	}

	public findDataParse(tableName: string, values: string) {
		return new Promise<boolean>(async (resolve, reject) => {
			if (this.db != null) {
				// console.log('SELECT * FROM ' + tableName + ' WHERE FILENAME = "' + values + '" LIMIT 1')
				this.db.executeSql('SELECT * FROM ' + tableName + ' WHERE FILENAME = "' + values + '" LIMIT 1', [])
					.then((res) => {
						res.rows.length > 0 ? resolve(true) : resolve(false);
					})
					.catch(err => {
						console.log('ERREUR SELECT FIND TABLE ', JSON.stringify(err))
						reject(false)
					})
			} else {
				reject(false)
			}
		})
	}

	public insertData(tableName: string, columns: string, values: string) {
		return new Promise<string>(async (resolve, reject) => {
			if (this.db != null) {
				// console.log('INSERT INTO (' + columns + ') VALUES ' + values)
				this.db.executeSql('INSERT INTO ' + tableName + ' (' + columns + ') VALUES ' + values, [])
					.then(() => {
						console.log('Ajout de données dans la table ' + tableName)
						resolve('ok')
					})
					.catch(err => {
						console.log('ERREUR INSERT INTO TABLE ', JSON.stringify(err))
						reject('err')
					})
			} else {
				console.log('ERREUR: La base de donnée est null')
				reject('err')
			}
		})
	}

	public updateData(tableName: string, values: string, condition: string) {
		if (this.db != null) {
			// console.log('UPDATE ' + tableName + ' SET ' + values + ' WHERE ' + condition)
			this.db.executeSql('UPDATE ' + tableName + ' SET ' + values + ' WHERE ' + condition, [])
				.then(() => {
					console.log('Modification de données dans la table ' + tableName)
				})
				.catch(err => console.log('ERREUR UPDATE TABLE ', JSON.stringify(err)))
		} else {
			console.log('ERREUR: La base de donnée est null')
		}
	}

	public dropTable(tableName: string) {
		if (this.db != null) {
			this.db.executeSql('DROP TABLE IF EXISTS ' + tableName, [])
				.then(() => {
					console.log('Suppression de la table ' + tableName)
				})
				.catch(err => console.log('ERREUR DROP TABLE ', JSON.stringify(err)))
		} else {
			console.log('ERROR: La base de donnée est null')
		}
	}
}