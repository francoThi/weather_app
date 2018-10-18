import { Component } from '@angular/core';

import { FoldersPage } from '../folders/folders';
import { SettingsPage } from '../settings/settings';
import { GraphsPage } from '../graphs/graphs';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = FoldersPage;
  tab2Root = SettingsPage;
  tab3Root = GraphsPage;

  constructor() {

  }
}
