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
					await this.dropTable('meteo')
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

	public insertData(tableName: string, columns: string, values: string) {
		return new Promise<any>(async (resolve, reject) => {
			if (this.db != null) {
				console.log(tableName)
				console.log('INSERT INTO (' + columns + ') VALUES '+ values)
				this.db.executeSql('INSERT INTO ' + tableName + ' (' + columns + ') VALUES '+ values, [])
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
			console.log('UPDATE '+tableName+' SET ' +values+ ' WHERE ' + condition)
			this.db.executeSql('UPDATE '+tableName+' SET ' +values+ ' WHERE ' + condition, [])
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