import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

document.addEventListener('WebViewJavascriptBridgeReady', (event: any) => {

  const appWindow = document.defaultView;
  const hasBridgeAlready = (window as any)['WebviewJavascriptBridge'] != null;

  if (hasBridgeAlready) {
    return;
  }
  const jsbridge = event['bridge'];
  platformBrowserDynamic([
    { provide: 'JSBridge', useValue: jsbridge },
  ]).bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
