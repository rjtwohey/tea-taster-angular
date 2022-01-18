import { Injectable } from '@angular/core';
import { Session } from '@app/models';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';
import { sessionLocked, sessionRestored } from '@app/store/actions';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { VaultFactoryService } from './vault-factory.service';

export type UnlockMode = 'Device' | 'SessionPIN' | 'NeverLock' | 'ForceLogin';

@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private vault: BrowserVault | Vault;
  private session: Session;
  private sessionKey = 'session';

  constructor(private modalController: ModalController, private store: Store, vaultFactory: VaultFactoryService) {
    const config: IdentityVaultConfig = {
      key: 'com.kensodemann.teataster',
      type: VaultType.SecureStorage,
      lockAfterBackgrounded: 5000,
      shouldClearVaultAfterTooManyFailedAttempts: true,
      customPasscodeInvalidUnlockAttempts: 2,
      unlockVaultOnLoad: false,
    };

    this.vault = vaultFactory.create(config);

    this.vault.onLock(() => {
      this.session = undefined;
      this.store.dispatch(sessionLocked());
    });

    this.vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) =>
      this.onPasscodeRequest(isPasscodeSetRequest)
    );
  }

  async login(session: Session, unlockMode: UnlockMode): Promise<void> {
    await this.setUnlockMode(unlockMode);
    this.session = session;
    await this.vault.setValue(this.sessionKey, session);
  }

  async logout(): Promise<void> {
    this.session = undefined;
    this.setUnlockMode('NeverLock');
    return this.vault.clear();
  }

  async restoreSession(): Promise<Session> {
    if (!this.session) {
      this.session = await this.vault.getValue(this.sessionKey);
      if (this.session) {
        this.store.dispatch(sessionRestored({ session: this.session }));
      }
    }
    return this.session;
  }

  async canUnlock(): Promise<boolean> {
    if ((await this.vault.doesVaultExist()) && (await this.vault.isLocked())) {
      return true;
    }
    return false;
  }

  private async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<void> {
    const dlg = await this.modalController.create({
      backdropDismiss: false,
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest,
      },
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    this.vault.setCustomPasscode(data || '');
  }

  private setUnlockMode(unlockMode: UnlockMode): Promise<void> {
    let type: VaultType;
    let deviceSecurityType: DeviceSecurityType;

    switch (unlockMode) {
      case 'Device':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.Both;
        break;

      case 'SessionPIN':
        type = VaultType.CustomPasscode;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      case 'ForceLogin':
        type = VaultType.InMemory;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      case 'NeverLock':
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      default:
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
    }

    return this.vault.updateConfig({
      ...this.vault.config,
      type,
      deviceSecurityType,
    });
  }
}
