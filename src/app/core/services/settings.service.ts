import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Observable, map } from 'rxjs';
import { FIRESTORE_COLLECTIONS, FIRESTORE_DOCUMENTS } from '../constants/firestore.constants';
import { FIREBASE_FIRESTORE } from '../firebase/firebase.providers';
import { AppSettings, defaultSettings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);
  private readonly settingsRef = doc(this.firestore, `${FIRESTORE_COLLECTIONS.settings}/${FIRESTORE_DOCUMENTS.mainSettings}`);

  readonly settings$: Observable<AppSettings> = new Observable<Record<string, unknown>>((subscriber) => {
    return onSnapshot(this.settingsRef, (snapshot) => subscriber.next(snapshot.data() ?? {}), (error) => subscriber.error(error));
  }).pipe(
    map((settings) => ({ ...defaultSettings, ...settings }) as AppSettings),
  );

  updateSettings(settings: Partial<AppSettings>): Promise<void> {
    return setDoc(this.settingsRef, settings, { merge: true });
  }
}
