import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateNotice } from './platform/update-notice';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UpdateNotice],
  template: '<router-outlet /><app-update-notice />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
