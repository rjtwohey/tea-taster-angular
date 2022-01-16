import { Injectable } from '@angular/core';
import { Session } from '@app/models';
import { sessionRestored } from '@app/store/actions';
import { Storage } from '@capacitor/storage';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private key = 'auth-session';

  constructor(private store: Store) {}

  async login(session: Session): Promise<void> {
    await Storage.set({ key: this.key, value: JSON.stringify(session) });
  }

  async restoreSession(): Promise<Session> {
    const { value } = await Storage.get({ key: this.key });
    const session = JSON.parse(value);

    if (session) {
      this.store.dispatch(sessionRestored({ session }));
    }

    return session;
  }

  async logout(): Promise<void> {
    return Storage.remove({ key: this.key });
  }
}
