import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FoldersPage } from './folders';
import { Db } from '../../services/database.service';

@NgModule({
	declarations: [
		FoldersPage,
	],
	imports: [
		IonicPageModule.forChild(FoldersPage),
		Db
	],
	providers: [
		Db
	]
})
export class FoldersPageModule {
}
