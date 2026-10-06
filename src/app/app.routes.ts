import { Routes } from '@angular/router';
import { Login } from './pages/onboarding/login/login';
import { Register } from './pages/onboarding/register/register';
import { sessionGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path: '', component: Login},
    {path: 'register', component: Register, canActivate: [sessionGuard]},
    {path: '**', redirectTo: ''},
];