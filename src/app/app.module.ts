import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { MatSidenavModule } from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ClickOutsideModule } from "ng-click-outside";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NotesComponent } from "./notes/notes.component";
import { AutoFocusDirective } from "./notes/auto-focus.directive";

@NgModule({
  declarations: [AppComponent, NotesComponent, AutoFocusDirective],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ClickOutsideModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
