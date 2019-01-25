import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  colorForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.createForms();
  }

  createForms(): void {
    this.colorForm = this._formBuilder.group({
      color: ['blue', Validators.required]
    });
  }
}
