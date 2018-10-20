import { Injectable } from '@angular/core';

@Injectable()
export class GlobalVars {

  constructor() {}
  
  private color: string = 'color-template-white';
  private language: string = 'fr';

  public setColorValue(variable: string): void {
    this.color = variable;
  }

  public getColorValue(): string {
    return this.color;
  }

  public setLanguageValue(variable: string): void {
    this.language = variable;
  }

  public getLanguageValue(): string {
    return this.language;
  }
}