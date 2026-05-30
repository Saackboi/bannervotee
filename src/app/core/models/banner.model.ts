import { Timestamp } from 'firebase/firestore';

export type BannerStatus = 'pending' | 'active' | 'inactive' | 'rejected';

export interface Banner {
  id: string;
  title: string;
  creatorName: string;
  groupName?: string;
  imageUrl: string;
  fileName?: string;
  status: BannerStatus;
  votes: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BannerInput {
  title: string;
  creatorName: string;
  imageUrl: string;
  status: BannerStatus;
}
