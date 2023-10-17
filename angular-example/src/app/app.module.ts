import { NgModule, Inject, Injector, NgZone } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BridgeService } from './bridge.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppInjector } from './app-injector';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [BridgeService],
  bootstrap: [AppComponent]
})
export class AppModule { 

constructor(
  @Inject('JSBridge') private jsbridge: object,
  private injector: Injector,
  private zone: NgZone,
  private bridgeService: BridgeService,
) {
    console.log('Initializing App Module...');
    AppInjector.setInjector(this.injector);
    bridgeService.init(this.jsbridge);
    bridgeService.setZone(this.zone);
  }
}