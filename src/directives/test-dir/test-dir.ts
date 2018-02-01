import { Directive } from '@angular/core';

/**
 * Generated class for the TestDirDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[test-dir]' // Attribute selector
})
export class TestDirDirective {

  constructor() {
    console.log('Hello TestDirDirective Directive');
  }

}
