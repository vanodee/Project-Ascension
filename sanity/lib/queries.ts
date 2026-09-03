// GROQ queries for all Sanity-backed content. Kept alongside the client so the
// query shape and the schema stay easy to cross-reference.

export const CLERGY_QUERY = /* groq */ `
  *[_type == "clergyMember"] | order(order asc) {
    name,
    "slug": slug.current,
    title,
    role,
    photo,
    bio,
    email,
    phone,
    order
  }
`;

export const CLERGY_MEMBER_QUERY = /* groq */ `
  *[_type == "clergyMember" && slug.current == $slug][0] {
    name,
    "slug": slug.current,
    title,
    role,
    photo,
    bio,
    email,
    phone,
    order
  }
`;

export const ANNOUNCEMENTS_QUERY = /* groq */ `
  *[_type == "announcement" && (!defined(expiresAt) || expiresAt > now())]
    | order(pinned desc, publishedAt desc) {
    title,
    "slug": slug.current,
    excerpt,
    body,
    image,
    society-> { "slug": slug.current, name, shortName, color, societyType, logo },
    pinned,
    publishedAt,
    expiresAt,
    eventDate,
    eventLocation
  }
`;

export const ANNOUNCEMENT_QUERY = /* groq */ `
  *[_type == "announcement" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    excerpt,
    body,
    image,
    society-> { "slug": slug.current, name, shortName, color, societyType, logo },
    pinned,
    publishedAt,
    expiresAt,
    eventDate,
    eventLocation
  }
`;

export const HOMILIES_QUERY = /* groq */ `
  *[_type == "homily"] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    "authorSlug": author->slug.current,
    "authorName": author->name,
    publishedAt,
    scriptureReferences,
    liturgicalSeason,
    body,
    "audioUrl": audioFile.asset->url,
    audioDurationSeconds
  }
`;

export const GALLERY_ALBUMS_QUERY = /* groq */ `
  *[_type == "galleryAlbum"] | order(eventDate desc) {
    title,
    "slug": slug.current,
    eventDate,
    description,
    coverImage,
    society-> { "slug": slug.current, name, shortName, color, societyType, logo },
    // Images only — filtered defensively even though the schema no longer
    // offers video items, in case any stray videoItem entries ever exist.
    media[_type == "imageItem"] {
      image,
      caption
    }
  }
`;

export const GALLERY_ALBUM_QUERY = /* groq */ `
  *[_type == "galleryAlbum" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    eventDate,
    description,
    coverImage,
    society-> { "slug": slug.current, name, shortName, color, societyType, logo },
    // Images only — filtered defensively even though the schema no longer
    // offers video items, in case any stray videoItem entries ever exist.
    media[_type == "imageItem"] {
      image,
      caption
    }
  }
`;

export const SOCIETIES_QUERY = /* groq */ `
  *[_type == "society" && societyType != "general"] | order(_createdAt asc) {
    "slug": slug.current,
    name,
    shortName,
    color,
    societyType,
    logo
  }
`;

export const SOCIETY_QUERY = /* groq */ `
  *[_type == "society" && slug.current == $slug][0] {
    "slug": slug.current,
    name,
    shortName,
    color,
    societyType,
    logo,
    subtitle,
    slogan,
    description,
    zonePatron,
    established,
    meetingDay,
    zoneLeader,
    contact
  }
`;

export const SACRAMENT_PAGES_QUERY = /* groq */ `
  *[_type == "sacramentPage"] {
    sacrament,
    title,
    label,
    summary,
    heroImage,
    "heroImageAspectRatio": heroImage.asset->metadata.dimensions.aspectRatio,
    body,
    tallyFormId
  }
`;

export const DONATION_CATEGORIES_QUERY = /* groq */ `
  *[_type == "donationCategory"] | order(_createdAt asc) {
    id,
    label,
    description
  }
`;

export const SITE_SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings"][0] {
    parishName,
    shortName,
    location,
    address,
    phone,
    email,
    facebookUrl,
    instagramUrl,
    youtubeChannelId
  }
`;

export const RECURRING_EVENTS_QUERY = /* groq */ `
  *[_type == "recurringEvent" && active == true] {
    _id,
    title,
    eventType,
    location,
    description,
    frequency,
    daysOfWeek,
    monthlyOrdinal,
    monthlyWeekday,
    startMode,
    anchorRelation,
    "anchorId": anchorEvent._ref,
    time,
    durationMinutes,
    startDate,
    endDate,
    overrides[] { date, mode, time, location, title, note }
  }
`;

// $historyFrom is a Lagos "YYYY-MM-DD" string (~13 months before today) — one-off
// events older than that are dropped to keep the payload lean. Recurring events
// have no such floor. Includes multi-day events still in progress.
export const PARISH_EVENTS_QUERY = /* groq */ `
  *[_type == "parishEvent" && coalesce(endDate, startDate) >= $historyFrom]
    | order(startDate asc) {
    _id,
    title,
    eventType,
    location,
    description,
    startDate,
    endDate,
    allDay,
    startMode,
    anchorRelation,
    "anchorId": anchorEvent._ref,
    startTime,
    endTime
  }
`;

export const ABOUT_PAGE_QUERY = /* groq */ `
  *[_type == "aboutPage"][0] {
    body,
    scriptureQuote,
    stats[] { _key, value, label },
    missionStatement,
    milestones[] { _key, year, title, tag, description }
  }
`;
