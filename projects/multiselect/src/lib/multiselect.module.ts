import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MultiselectComponent } from './multiselect.component';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [MultiselectComponent, SanitizeHtmlPipe],
  exports: [MultiselectComponent]
})
export class MultiselectModule { }
