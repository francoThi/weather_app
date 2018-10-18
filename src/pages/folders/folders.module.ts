import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FoldersPage } from './folders';

@NgModule({
  declarations: [
    FoldersPage,
  ],
  imports: [
    IonicPageModule.forChild(FoldersPage),
  ],
})
export class FoldersPageModule {
}
