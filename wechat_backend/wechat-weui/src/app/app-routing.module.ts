import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { MessageComponent } from './message/message.component';
import { ReportComponent } from './report/report.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  { path: '', component: UserComponent },
  { path: 'help', component: HelpComponent },
  { path: 'message', component: MessageComponent },
  { path: 'report', component: ReportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
