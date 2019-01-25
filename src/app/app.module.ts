import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { MultiselectModule } from 'projects/multiselect/src/public_api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    MultiselectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
