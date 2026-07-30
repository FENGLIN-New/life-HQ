export type DomainId = "work" | "personal" | "startup";

export interface Topic {
  id: string;
  domain: DomainId;
  title: string;
  note: string;
  chatLink: string;
  reminderAt: string;
  pinned: boolean;
  updatedAt: string;
}

export interface StickyNote {
  id: string;
  text: string;
  createdAt: string;
}
