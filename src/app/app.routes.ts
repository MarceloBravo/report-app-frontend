import { Routes } from '@angular/router';
import { Login } from './pages/onboarding/login/login';
import { Register } from './pages/onboarding/register/register';

export const routes: Routes = [
    {path: '', component: Login},
    {path: 'register', component: Register},
    {path: '**', redirectTo: ''},
];
