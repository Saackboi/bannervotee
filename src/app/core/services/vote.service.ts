import { Injectable, inject } from '@angular/core';
import { FieldValue, Firestore, doc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../constants/firestore.constants';
import { FIREBASE_FIRESTORE } from '../firebase/firebase.providers';
import { Vote } from '../models/vote.model';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);

  async hasVoted(userId: string): Promise<boolean> {
    const voteRef = doc(this.firestore, `${FIRESTORE_COLLECTIONS.votes}/${userId}`);

    return runTransaction(this.firestore, async (transaction) => {
      const voteSnapshot = await transaction.get(voteRef);
      return voteSnapshot.exists();
    });
  }

  async vote(bannerId: string, userId: string): Promise<void> {
    const voteRef = doc(this.firestore, `${FIRESTORE_COLLECTIONS.votes}/${userId}`);
    const bannerRef = doc(this.firestore, `${FIRESTORE_COLLECTIONS.banners}/${bannerId}`);

    await runTransaction(this.firestore, async (transaction) => {
      const existingVote = await transaction.get(voteRef);

      if (existingVote.exists()) {
        throw new Error('Ya registraste tu voto anteriormente.');
      }

      transaction.set(voteRef, {
        bannerId,
        userId,
        createdAt: serverTimestamp(),
      });

      transaction.update(bannerRef, {
        votes: increment(1),
      });
    });
  }
}
