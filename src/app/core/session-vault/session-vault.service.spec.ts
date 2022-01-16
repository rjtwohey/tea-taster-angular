import { TestBed } from '@angular/core/testing';
import { Session } from '@app/models';
import { sessionRestored } from '@app/store/actions';
import { Storage } from '@capacitor/storage';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { SessionVaultService } from './session-vault.service';

describe('SessionVaultService', () => {
  let service: SessionVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore()],
    });
    service = TestBed.inject(SessionVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('saves the session in storage', async () => {
      spyOn(Storage, 'set');
      const session: Session = {
        user: {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        token: '19940059fkkf039',
      };
      await service.login(session);
      expect(Storage.set).toHaveBeenCalledTimes(1);
      expect(Storage.set).toHaveBeenCalledWith({
        key: 'auth-session',
        value: JSON.stringify(session),
      });
    });
  });

  describe('restoreSession', () => {
    it('gets the session from storage', async () => {
      spyOn(Storage, 'get').and.returnValue(Promise.resolve({ value: null }));
      await service.restoreSession();
      expect(Storage.get).toHaveBeenCalledTimes(1);
      expect(Storage.get).toHaveBeenCalledWith({
        key: 'auth-session',
      });
    });

    describe('with a session', () => {
      const session: Session = {
        user: {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        token: '19940059fkkf039',
      };
      beforeEach(() => {
        spyOn(Storage, 'get').and.returnValue(Promise.resolve({ value: JSON.stringify(session) }));
      });

      it('resolves the session', async () => {
        expect(await service.restoreSession()).toEqual(session);
      });

      it('dispatches session restored', async () => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        await service.restoreSession();
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(sessionRestored({ session }));
      });
    });

    describe('without a session', () => {
      beforeEach(() => {
        spyOn(Storage, 'get').and.returnValue(Promise.resolve({ value: null }));
      });

      it('resolves null', async () => {
        expect(await service.restoreSession()).toEqual(null);
      });

      it('does not dispatch session restored', async () => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        await service.restoreSession();
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('clears the storage', async () => {
      spyOn(Storage, 'remove');
      await service.logout();
      expect(Storage.remove).toHaveBeenCalledTimes(1);
      expect(Storage.remove).toHaveBeenCalledWith({
        key: 'auth-session',
      });
    });
  });
});
