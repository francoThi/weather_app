import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { FoldersPage } from '../pages/folders/folders';
import { SettingsPage } from '../pages/settings/settings';
import { GraphsPage } from '../pages/graphs/graphs';
import { TabsPage } from '../pages/tabs/tabs';

import { GlobalVars } from '../services/settings.service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { FileTransfer } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { FileOpener } from '@ionic-native/file-opener'
import { FileChooser } from '@ionic-native/file-chooser';
import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';
import { Db } from '../services/database.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    FoldersPage,
    SettingsPage,
    GraphsPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    FoldersPage,
    SettingsPage,
    GraphsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GlobalVars,
    AndroidPermissions,
    FileOpener,
    FileTransfer,
    FilePath,
    FileChooser,
    File,
    SQLite,
    Db,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
