import {NgModule} from "@angular/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatPaginatorModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule,
  MatAutocompleteModule, MatCheckboxModule, MatExpansionModule, MatToolbarModule, MatDialogModule, MatIconModule,
  MatButtonModule, MatMenuModule, MatSelectModule, MatCardModule, MatTabsModule, MatListModule, MatStepperModule
} from "@angular/material";
import {CdkTableModule} from "@angular/cdk/table";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter'

const modules = [
  MatTableModule,
  MatSortModule,
  MatAutocompleteModule,
  MatPaginatorModule,
  BrowserAnimationsModule,
  MatFormFieldModule,
  MatInputModule,
  CdkTableModule,
  MatDatepickerModule,
  MatMomentDateModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatToolbarModule,
  MatDialogModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatSelectModule,
  MatCardModule,
  MatTabsModule,
  MatListModule,
  MatStepperModule
];


@NgModule({
  imports: modules,
  exports: modules
})
export class AppMaterialModule {
}

