import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BridgeService {

  public _bridge: any = null;
  constructor(private zone: NgZone) { }

  setZone(zone: NgZone) {
    this.zone = zone;
  }

  init(bridge: Object) {
    this._bridge = bridge;
    this._bridge.init(function(message: any, _responseCallback: any) {
    console.log('Received message: ', message);
    });
    console.log('Bridge ready!');

  }

  sendRequest(request: Object): Observable<any> {
    console.log('Bridge[Requesting]: ', request);
    return new Observable(
      (observer) => {
        /* ask bridge object to send object */
          const self = this;
          try {
              self._bridge.send(request, (bridgeResponse: any) => {
                console.log('Bridge[Responding]: ', bridgeResponse);
                  self.zone.run(
                      () => {
                          /* return bridgeResponse */
                          observer.next(bridgeResponse);
                          observer.complete();
                      }
                  );
              });
        } catch (err) {
          /* send request failed => return an error */
          observer.error(err);
        }
      }
    );
  }

  addHandler(handlerName: string, handler: Function) {
    this._bridge.registerHandler(handlerName, handler);
  }

  removeHandler(handlerName: string) {
    this._bridge.deregisterHandler(handlerName);
  }

  selectObjects(query: string, objType: string): Observable<any> {
        const request: any = {};
        const dataObj = {
            'query': query
        };
        request['type'] = 'select';
        request['object'] = objType;
        request['data'] = dataObj;
        return this.sendRequest(request);
  }

  getBridge(): any {
    return this._bridge;
  }
}
