export interface AppSettings {
  showcaseOpen: boolean;
  votingOpen: boolean;
  showRankingAfterVote: boolean;
  groupName: string;
}

export const defaultSettings: AppSettings = {
  showcaseOpen: true,
  votingOpen: true,
  showRankingAfterVote: true,
  groupName: 'Grupo Organizador',
};

export type EventSettings = AppSettings;
