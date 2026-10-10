import { Routes } from '@angular/router';
import { Login } from './pages/onboarding/login/login';
import { Register } from './pages/onboarding/register/register';
import { QueryExecute } from './pages/workspace/query_execute/query-execute/query-execute';

export const routes: Routes = [
    {path: '', component: Login},
    {path: 'register', component: Register},
    {path: 'query-execute', component: QueryExecute, canActivate: [() => true]},
    {path: '**', redirectTo: ''},
];