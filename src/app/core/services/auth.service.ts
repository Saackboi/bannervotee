import { Injectable, inject } from '@angular/core';
import { Auth, User, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Firestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Observable, firstValueFrom, map, of, switchMap, take } from 'rxjs';
import { FIRESTORE_COLLECTIONS } from '../constants/firestore.constants';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '../firebase/firebase.providers';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly firestore = inject(FIREBASE_FIRESTORE);

  readonly user$ = new Observable<User | null>((subscriber) => onAuthStateChanged(this.auth, subscriber));
  readonly isAdmin$ = this.user$.pipe(
    switchMap((user) => this.adminStateFor(user)),
  );

  async ensureAnonymousSession(): Promise<User> {
    if (this.auth.currentUser) {
      return this.auth.currentUser;
    }

    const credential = await signInAnonymously(this.auth);
    return credential.user;
  }

  loginAdmin(email: string, password: string): Promise<unknown> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  async isCurrentUserAdmin(): Promise<boolean> {
    const user = this.auth.currentUser;

    if (!user || user.isAnonymous) {
      return false;
    }

    const adminSnapshot = await getDoc(doc(this.firestore, `${FIRESTORE_COLLECTIONS.admins}/${user.uid}`));
    return adminSnapshot.exists();
  }

  isCurrentUserAdminLive(): Promise<boolean> {
    return firstValueFrom(this.isAdmin$.pipe(take(1)));
  }

  private adminStateFor(user: User | null): Observable<boolean> {
    if (!user || user.isAnonymous) {
      return of(false);
    }

    const adminRef = doc(this.firestore, `${FIRESTORE_COLLECTIONS.admins}/${user.uid}`);
    return new Observable<boolean>((subscriber) => {
      return onSnapshot(adminRef, (snapshot) => subscriber.next(snapshot.exists()), (error) => subscriber.error(error));
    });
  }
}
