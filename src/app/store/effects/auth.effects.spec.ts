import { TestBed } from '@angular/core/testing';
import { SessionVaultService } from '@app/core/session-vault/session-vault.service';
import { createSessionVaultServiceMock } from '@app/core/testing';
import { login, loginSuccess, logout, logoutSuccess } from '@app/store/actions';
import { NavController } from '@ionic/angular';
import { provideMockActions } from '@ngrx/effects/testing';
import { createNavControllerMock } from '@test/mocks';
import { Observable, of } from 'rxjs';
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
      ],
    });
    effects = TestBed.inject(AuthEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('login$', () => {
    describe('on login success', () => {
      it('dispatches login success', (done) => {
        actions$ = of(login({ email: 'test@test.com', password: 'test' }));
        effects.login$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Auth API] login success',
            session: {
              user: {
                id: 73,
                firstName: 'Ken',
                lastName: 'Sodemann',
                email: 'test@test.com',
              },
              token: '314159',
            },
          });
          done();
        });
      });

      it('saves the session', (done) => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(login({ email: 'test@test.com', password: 'test' }));
        effects.login$.subscribe(() => {
          expect(sessionVaultService.login).toHaveBeenCalledTimes(1);
          expect(sessionVaultService.login).toHaveBeenCalledWith({
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
            token: '314159',
          });
          done();
        });
      });
    });

    describe('on login failure', () => {
      it('dispatches login error', (done) => {
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Auth API] login failure',
            errorMessage: 'Invalid Username or Password',
          });
          done();
        });
      });

      it('does not save the session', (done) => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(login({ email: 'test@test.com', password: 'badpass' }));
        effects.login$.subscribe(() => {
          expect(sessionVaultService.login).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('loginSuccess$', () => {
    it('navigates to the root path', (done) => {
      const navController = TestBed.inject(NavController);
      actions$ = of(
        loginSuccess({
          session: {
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
            token: '314159',
          },
        })
      );
      effects.loginSuccess$.subscribe(() => {
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });

  describe('logout$', () => {
    describe('on logout success', () => {
      it('dispatches logout success', (done) => {
        actions$ = of(logout());
        effects.logout$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Auth API] logout success',
          });
          done();
        });
      });

      it('clears the session', (done) => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(logout());
        effects.logout$.subscribe(() => {
          expect(sessionVaultService.logout).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  describe('logoutSuccess$', () => {
    it('navigates to the root path', (done) => {
      const navController = TestBed.inject(NavController);
      actions$ = of(logoutSuccess());
      effects.logoutSuccess$.subscribe(() => {
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
        done();
      });
    });
  });
});
