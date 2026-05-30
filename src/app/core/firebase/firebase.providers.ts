import { InjectionToken, Provider } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('FIREBASE_FIRESTORE');

export const firebaseProviders: Provider[] = [
  {
    provide: FIREBASE_APP,
    useFactory: () => initializeApp(environment.firebase),
  },
  {
    provide: FIREBASE_AUTH,
    deps: [FIREBASE_APP],
    useFactory: (app: FirebaseApp) => getAuth(app),
  },
  {
    provide: FIREBASE_FIRESTORE,
    deps: [FIREBASE_APP],
    useFactory: (app: FirebaseApp) => getFirestore(app),
  },
];
