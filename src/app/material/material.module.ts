import {NgModule} from "@angular/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatPaginatorModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule,
  MatAutocompleteModule
} from "@angular/material";
import {CdkTableModule} from "@angular/cdk/table";

const modules = [
  MatTableModule,
  MatTableModule,
  MatSortModule,
  MatAutocompleteModule,
  MatPaginatorModule,
  BrowserAnimationsModule,
  MatFormFieldModule,
  MatInputModule,
  CdkTableModule
];


@NgModule({
  imports: modules,
  exports: modules
})
export class AppMaterialModule {
}

