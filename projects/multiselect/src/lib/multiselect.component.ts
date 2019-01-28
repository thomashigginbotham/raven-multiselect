import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  Input
} from '@angular/core';
import {
  ControlValueAccessor,
  Validator,
  AbstractControl,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS
} from '@angular/forms';

import { SelectOption } from './interfaces';

interface SvgIcons {
  arrowDown: string,
  close: string
};

@Component({
  selector: 'raven-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiselectComponent),
    multi: true
  }, {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MultiselectComponent),
    multi: true
  }]
})
export class MultiselectComponent
  implements AfterViewInit, ControlValueAccessor, Validator {
  @Input()
  enableCustomValues: boolean;

  @Input()
  placeholder: string;

  @ViewChild('selectControl')
  selectControl: ElementRef;

  choices: SelectOption[];
  availableChoices: SelectOption[];
  selectedValues: string[];
  customValue: string;
  isMenuOpen: boolean;

  private _icons: SvgIcons;
  private _propagateChange: (data: string) => { };

  constructor(
    private _elementRef: ElementRef
  ) {
    // Default settings
    this.enableCustomValues = false;
    this.placeholder = 'Type and press Enter';
    this.choices = [];
    this.selectedValues = [];
    this.isMenuOpen = false;

    // Icons
    this.icons = {
      arrowDown: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg>',
      close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>'
    }
  }

  get icons(): SvgIcons {
    return this._icons;
  }

  @Input()
  set icons(value: SvgIcons) {
    this._icons = value;

    // Inject <style> to penetrate shadow DOM
    this._icons.arrowDown = '<style>raven-multiselect svg {height: calc(var(--rms-control-height, 4rem) / 4)}</style>' + value['arrowDown'];
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.choices = this.getChoices();
      this.availableChoices = this.getUnselectedChoices();
      this.selectedValues.forEach(value => this.selectOptionByValue(value));
    });
  }

  onChange(event: any): void {
    const values: string[] = Array.from(event.target.selectedOptions)
      .map((option: HTMLOptionElement) => option.value);

    this.selectedValues = values;

    this._propagateChange(this.selectedValues.join(','));
  }

  onAddChoiceClick(value: string): void {
    this.addSelectedValue(value);
    this.selectOptionByValue(value);
    this.availableChoices = this.getUnselectedChoices();
    this.customValue = '';

    this._propagateChange(this.selectedValues.join(','));
  }

  onRemoveChoiceClick(value: string): void {
    this.removeSelectedValue(value);
    this.selectOptionByValue(value, true);
    this.availableChoices = this.getUnselectedChoices();

    this._propagateChange(this.selectedValues.join(','));
  }

  onTextInput(event: any): void {
    // Limit available choices
    const keyword = event.target.value;

    if (keyword) {
      this.availableChoices = this.findChoicesByKeyword(
        keyword, this.getUnselectedChoices()
      );

      if (!this.availableChoices.length && this.enableCustomValues) {
        this.availableChoices
          .push({ text: this.customValue, value: this.customValue });
      }
    } else {
      this.availableChoices = this.getUnselectedChoices();
    }
  }

  onTextEnterKey(): void {
    if (this.customValue === '') {
      return;
    }

    // Add choice if it exists in unselected choices
    const unselectedChoices = this.getUnselectedChoices();
    const matchingChoice = unselectedChoices.find(choice =>
      this.customValue.toLowerCase() === choice.text.toLowerCase());

    if (matchingChoice) {
      this.addSelectedValue(matchingChoice.value);
      this.selectOptionByValue(matchingChoice.value);
      this.availableChoices = this.getUnselectedChoices();
      this.customValue = '';

      this._propagateChange(this.selectedValues.join(','));

      return;
    }

    // Add custom value if not in available choices
    if (this.enableCustomValues) {
      this.addSelectedValue(this.customValue);
      this.availableChoices = this.getUnselectedChoices();
      this.customValue = '';

      this._propagateChange(this.selectedValues.join(','));
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target): void {
    if (!this._elementRef.nativeElement.contains(target)) {
      this.closeMenu();
    }
  }

  /**
   * Returns the available choices provided by the transcluded content.
   */
  getChoices(): SelectOption[] {
    const selectElement = this.selectControl.nativeElement as HTMLSelectElement;

    const choices = Array.prototype.map
      .call(selectElement.childNodes, (child: HTMLOptionElement) => {
        return {
          text: child.textContent,
          value: child.value
        };
      });

    return choices;
  }

  /**
   * Returns friendly text for a given option value.
   * @param value The value for which to retrieve text.
   */
  getTextForValue(value: string): string {
    if (!this.choices || !this.choices.length) {
      return value;
    }

    const choice = this.choices.find(choice => choice.value === value);

    if (typeof choice === 'undefined') {
      return value;
    }

    return choice.text;
  }

  /**
   * Returns choices that have not been selected.
   */
  getUnselectedChoices(): SelectOption[] {
    return this.choices
      .filter(choice => !this.selectedValues.includes(choice.value));
  }

  /**
   * Searches choices by keyword and returns matches.
   * @param keyword The keyword to find.
   * @param choices Choices to search.
   */
  findChoicesByKeyword(
    keyword: string,
    choices: SelectOption[]
  ): SelectOption[] {
    const keywordLower = keyword.toLowerCase();

    return choices.filter(choice =>
      choice.text.toLowerCase().includes(keywordLower));
  }

  /**
   * Adds a value to the array of selected values.
   * @param value The value to add.
   */
  addSelectedValue(value: string): void {
    if (this.selectedValues.includes(value)) {
      return;
    }

    this.selectedValues.push(value);
  }

  /**
   * Removes a value from the array of selected values.
   * @param value
   */
  removeSelectedValue(value: string): void {
    const index = this.selectedValues.findIndex(x => x === value);

    if (index > -1) {
      this.selectedValues.splice(index, 1);
    }
  }

  /**
   * Sets the "selected" attribute of an option.
   * @param value The value of the option to select.
   * @param value Whether to deselect the option instead.
   */
  selectOptionByValue(value: string, deselect: boolean = false): void {
    const selectElement = this.selectControl.nativeElement as HTMLSelectElement;
    const optionElement = Array.prototype.find.call(
      selectElement.options,
      (option: HTMLOptionElement) => option.value === value
    );

    if (typeof optionElement !== 'undefined') {
      optionElement.selected = !deselect;
    }
  }

  /**
   * Opens the drop-down menu.
   */
  openMenu(): void {
    this.isMenuOpen = true;
  }

  /**
   * Closes the drop-down menu.
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  /**
   * Toggles the menu open/closed.
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  writeValue(value: string): void {
    if (!value) {
      return;
    }

    this.selectedValues = value.split(',');
  }

  registerOnChange(fn: (data: string) => { }): void {
    this._propagateChange = fn;
  }

  registerOnTouched(): void { }

  validate(control: AbstractControl): { [key: string]: any } {
    return null;
  }
}
