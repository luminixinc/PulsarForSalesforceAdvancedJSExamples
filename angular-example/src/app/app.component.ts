import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BridgeService } from './bridge.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  userInfoText$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  constructor(
    private bridge: BridgeService,
  ) {

    this.bridge.sendRequest({ 'type': 'userInfo' }).subscribe((response: any) => {
      console.log('Received response: ', response);
      this.userInfoText$.next(JSON.stringify(response, null, 2));
    });


  }
}
