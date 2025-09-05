import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: spy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockState = {} as RouterStateSnapshot;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow access when logged in', () => {
    localStorage.setItem('isLoggedIn', 'true');
    const route = {} as ActivatedRouteSnapshot;
    expect(guard.canActivate(route, mockState)).toBeTrue();
  });

  it('should deny access and redirect when not logged in', () => {
    localStorage.setItem('isLoggedIn', 'false');
    const route = {} as ActivatedRouteSnapshot;
    const result = guard.canActivate(route, mockState);
    expect(result instanceof UrlTree).toBeTrue();
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/');
  });

  it('should allow access when role matches expectedRole', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', 'hr');

    const routeWithRole = { data: { expectedRole: 'hr' } } as Partial<ActivatedRouteSnapshot>;
    const result = guard.canActivate(routeWithRole as ActivatedRouteSnapshot, mockState);

    expect(result).toBeTrue();
  });

  it('should deny access when role mismatch', () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', 'manager');

    const routeWithRole = { data: { expectedRole: 'hr' } } as Partial<ActivatedRouteSnapshot>;
    const result = guard.canActivate(routeWithRole as ActivatedRouteSnapshot, mockState);

    expect(result instanceof UrlTree).toBeTrue();
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/unauthorized');
  });
});
