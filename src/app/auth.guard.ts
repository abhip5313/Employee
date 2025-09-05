import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service'; // AuthService वापरले

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isLoggedIn = this.auth.isLoggedIn();
    const userRole = this.auth.getUserRole(); // ✅ AuthService मधून घेतो

    if (!isLoggedIn) {
      // जर login नसेल तर login page वर redirect
      return this.router.parseUrl('/');
    }

    // ✅ जर route मध्ये expectedRole दिलं असेल तर role match करतो
    const expectedRole = route.data['expectedRole'];
    if (expectedRole && userRole !== expectedRole) {
      // role mismatch झाल्यास unauthorized page कडे redirect
      return this.router.parseUrl('/unauthorized');
    }

    return true;
  }
}
