import {Component, Input} from '@angular/core';

/**
 * Generated class for the ToolbarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-toolbar',
  templateUrl: 'toolbar.html'
})
export class ToolbarComponent {

  @Input()
  title: string = '';

  constructor() {
  }
}
