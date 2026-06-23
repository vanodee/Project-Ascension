// Shared domain types for the Ascension parish website.
// These mirror the Sanity schema document types defined in the PRD (section 6),
// so swapping the mock data layer for real GROQ queries is a drop-in change.

export type ClergyRole = 'priest' | 'reverend_sister' | 'catechist';

export interface ClergyMember {
  slug: string;
  name: string;
  title: string;
  role: ClergyRole;
  photo: string;
  bio: string;
  email: string;
  phone?: string;
  order: number;
}

export type AnnouncementCategory = 'general' | 'liturgy' | 'youth' | 'charity';

export interface Announcement {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  publishedAt: string;
  expiresAt?: string;
  pinned: boolean;
  category: AnnouncementCategory;
  image: string;
  eventDate?: string;
  eventLocation?: string;
}

export type LiturgicalSeason =
  | 'Advent'
  | 'Christmas'
  | 'Lent'
  | 'Easter'
  | 'Ordinary Time';

export interface Homily {
  slug: string;
  title: string;
  authorSlug: string;
  authorName: string;
  publishedAt: string;
  scriptureReference: string;
  liturgicalSeason: LiturgicalSeason;
  body: string[];
  audioUrl: string;
  audioDuration: string;
}

export type GalleryCategory = 'Liturgical' | 'Youth' | 'Outreach' | 'Fundraiser';

export interface GalleryMediaItem {
  type: 'image' | 'video';
  url: string;
  caption: string;
  altText: string;
}

export interface GalleryAlbum {
  slug: string;
  title: string;
  eventDate: string;
  category: GalleryCategory;
  coverImage: string;
  description: string;
  media: GalleryMediaItem[];
}

export type SacramentKey =
  | 'rcia'
  | 'baptism'
  | 'eucharist'
  | 'confirmation'
  | 'reconciliation'
  | 'anointing'
  | 'matrimony';

export interface SacramentPage {
  sacrament: SacramentKey;
  title: string;
  label: string;
  summary: string;
  heroImage: string;
  body: string[];
  tallyFormId?: string;
}

export interface DonationCategory {
  id: string;
  label: string;
  description: string;
}

export interface PsalmLine {
  text: string;
  isRefrain: boolean;
  isContinuation: boolean;
  isStropheStart: boolean;
}

export interface Reading {
  label: string;
  reference: string;
  excerpt: string;
  text: string[];
  psalmLines?: PsalmLine[];
}

export interface DailyReadings {
  date: string;
  /** Primary day + any optional memorials, each as its own string (Universalis "or" separators split out). */
  celebrations: string[];
  lectionaryYear: string;
  season: LiturgicalSeason;
  colourVar: string;
  copyright: string;
  readings: Reading[];
}

export type CalendarEventType =
  | 'mass'
  | 'confession'
  | 'parish_event'
  | 'meeting'
  | 'celebration';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start: string;
  end: string;
  location: string;
  description: string;
}

export interface LivestreamStatus {
  isLive: boolean;
  videoId: string;
  title: string;
  viewerCount?: number;
}

export interface MassTimeGroup {
  heading: string;
  times: string[];
  note: string;
}

export interface SiteSettings {
  parishName: string;
  shortName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeChannelId: string;
  massTimes: MassTimeGroup[];
}
