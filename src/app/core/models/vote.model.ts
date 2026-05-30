import { Timestamp } from 'firebase/firestore';

export interface Vote {
  bannerId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface VoteRecord extends Vote {
  id: string;
}
