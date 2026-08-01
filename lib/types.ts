export type DomainId = "work" | "personal" | "startup";

export interface Topic {
  id: string;
  domain: DomainId;
  title: string;
  note: string;
  chatLink: string;
  reminderAt: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  history: string[];
  order: number;
}

export interface StickyNote {
  id: string;
  text: string;
  createdAt: string;
}
