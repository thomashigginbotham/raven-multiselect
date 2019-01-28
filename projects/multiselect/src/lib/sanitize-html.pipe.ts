import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(
    private _domSanitizer: DomSanitizer
  ) { }

  transform(value: any): SafeHtml {
    return this._domSanitizer.bypassSecurityTrustHtml(value);
  }
}
