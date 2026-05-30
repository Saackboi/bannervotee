import { Injectable, inject } from '@angular/core';
import { Firestore, Query, addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FIRESTORE_COLLECTIONS } from '../constants/firestore.constants';
import { FIREBASE_FIRESTORE } from '../firebase/firebase.providers';
import { Banner, BannerInput, BannerStatus } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);
  private readonly bannersRef = collection(this.firestore, FIRESTORE_COLLECTIONS.banners);

  readonly allBanners$: Observable<Banner[]> = this.listenToBanners(query(this.bannersRef, orderBy('createdAt', 'desc')));

  readonly activeBanners$: Observable<Banner[]> = this.listenToBanners(query(this.bannersRef, where('status', '==', 'active')));

  async createBanner(input: BannerInput): Promise<void> {
    await addDoc(this.bannersRef, {
      title: input.title,
      creatorName: input.creatorName,
      imageUrl: input.imageUrl,
      status: input.status,
      votes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateBanner(id: string, input: BannerInput): Promise<void> {
    await updateDoc(doc(this.firestore, `${FIRESTORE_COLLECTIONS.banners}/${id}`), {
      title: input.title,
      creatorName: input.creatorName,
      imageUrl: input.imageUrl,
      status: input.status,
      updatedAt: serverTimestamp(),
    });
  }

  updateStatus(id: string, status: BannerStatus): Promise<void> {
    return updateDoc(doc(this.firestore, `${FIRESTORE_COLLECTIONS.banners}/${id}`), {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteBanner(banner: Banner): Promise<void> {
    await deleteDoc(doc(this.firestore, `${FIRESTORE_COLLECTIONS.banners}/${banner.id}`));
  }

  private listenToBanners(bannerQuery: Query): Observable<Banner[]> {
    return new Observable<Banner[]>((subscriber) => {
      return onSnapshot(
        bannerQuery,
        (snapshot) => subscriber.next(snapshot.docs.map((bannerDoc) => ({ id: bannerDoc.id, ...bannerDoc.data() }) as Banner)),
        (error) => subscriber.error(error),
      );
    });
  }
}
