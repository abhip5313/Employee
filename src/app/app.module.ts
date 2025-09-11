import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { FormsModule } from '@angular/forms';

// Standalone root component (declarations मध्ये टाकायचं नाही)
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    // ❌ काहीही declare करायचं नाही
    // कारण ProfileComponent, AccDashboardComponent वगैरे जर standalone असतील तर
    // इथे declare करण्याची गरज नाही
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: []   // ✅ root component bootstrap इथेच करायचा
})
export class AppModule {}
