import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@/sanity/lib/client';
import { imageUrl } from '@/sanity/lib/image';
import { CLERGY_QUERY, CLERGY_MEMBER_QUERY } from '@/sanity/lib/queries';
import type { ClergyMember } from './types';

interface ClergyMemberDoc {
  name: string;
  slug: string;
  title: string;
  role: ClergyMember['role'];
  photo: SanityImageSource;
  bio: string;
  email: string;
  phone?: string;
  order: number;
}

function toClergyMember(doc: ClergyMemberDoc): ClergyMember {
  return {
    slug: doc.slug,
    name: doc.name,
    title: doc.title,
    role: doc.role,
    photo: imageUrl(doc.photo, 800),
    bio: doc.bio,
    email: doc.email,
    ...(doc.phone ? { phone: doc.phone } : {}),
    order: doc.order,
  };
}

export async function getClergy(): Promise<ClergyMember[]> {
  const docs = await client.fetch<ClergyMemberDoc[]>(CLERGY_QUERY);
  return docs.map(toClergyMember);
}

export async function getClergyMember(slug: string): Promise<ClergyMember | undefined> {
  const doc = await client.fetch<ClergyMemberDoc | null>(CLERGY_MEMBER_QUERY, { slug });
  return doc ? toClergyMember(doc) : undefined;
}
