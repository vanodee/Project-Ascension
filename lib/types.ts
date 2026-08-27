// Shared domain types for the Ascension parish website.
// These mirror the Sanity schema document types defined in the PRD (section 6).
// Image fields are resolved to CDN URL strings and `body` fields are Portable
// Text by the corresponding lib/*.ts fetch functions.

import type { PortableTextBlock } from '@portabletext/types';

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

export type SocietyType =
  | 'parish_zone'
  | 'demographic_organization'
  | 'pious_devotional'
  | 'charismatic_movement'
  | 'knightly_professional'
  | 'liturgical_ministry'
  | 'general';

export interface Society {
  slug: string;
  name: string;
  shortName: string;
  color: string;
  societyType: SocietyType;
  logo: string;
}

export interface SocietySlogan {
  greeting: string;
  response: string;
}

export interface SocietyDetail extends Society {
  subtitle?: string;
  slogan?: SocietySlogan;
  description?: PortableTextBlock[];
  zonePatron?: string;
  established?: string;
  meetingDay?: string;
  zoneLeader?: string[];
  contact?: string[];
}

export interface Announcement {
  slug: string;
  title: string;
  excerpt: string;
  body: PortableTextBlock[];
  publishedAt: string;
  expiresAt?: string;
  pinned: boolean;
  image: string | null;
  society: Society;
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
  body: PortableTextBlock[];
  audioUrl: string;
  audioDuration: string;
}

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
  coverImage: string;
  description: string;
  society: Society;
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
  body: PortableTextBlock[];
  tallyFormId?: string;
}

export interface AboutPage {
  title: string;
  heroImage: string;
  missionStatement: string;
  body: PortableTextBlock[];
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
