import { revalidatePath } from 'next/cache';
import { parseBody } from 'next-sanity/webhook';
import { type NextRequest, NextResponse } from 'next/server';

interface WebhookPayload {
  _type: string;
  slug?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Skip the built-in 3s eventual-consistency wait — we only call revalidatePath,
    // we never re-fetch data in this request, so there's nothing for it to protect.
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_WEBHOOK_SECRET,
      false,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: 'Bad Request — missing _type' }, { status: 400 });
    }

    if (body._type === 'siteSettings') {
      // Header/footer contact details are shared across every (site) page via the layout.
      revalidatePath('/', 'layout');
      return NextResponse.json({ revalidated: true, paths: ['/ (layout)'], now: Date.now() });
    }

    const paths = pathsToRevalidate(body._type, body.slug);
    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths, now: Date.now() });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}

function pathsToRevalidate(type: string, slug?: string): string[] {
  switch (type) {
    case 'announcement':
      // Announcements render in a modal on '/' and '/announcements' — no dedicated
      // detail route to revalidate per-slug.
      return ['/', '/announcements'];
    case 'homily':
      // Homilies play inline from the archive via a sticky player — no dedicated
      // detail route to revalidate per-slug.
      return ['/', '/homilies'];
    case 'galleryAlbum':
      return ['/', '/gallery', ...(slug ? [`/gallery/${slug}`] : [])];
    case 'sacramentPage':
      return ['/sacraments', ...(slug ? [`/sacraments/${slug}`] : [])];
    case 'clergyMember':
      // Homily pages show the author's name via a resolved reference.
      return ['/', '/clergy', '/homilies'];
    case 'society':
      // Society name/logo is embedded via dereference on announcement & gallery cards,
      // and listed directly on the Societies page.
      return ['/', '/announcements', '/gallery', '/societies'];
    case 'donationCategory':
      return ['/give'];
    case 'recurringEvent':
    case 'parishEvent':
      // Mass/Confession times are derived from the schedule on the home, contact,
      // and livestream pages too.
      return ['/schedule', '/', '/contact', '/livestream'];
    case 'aboutPage':
      return ['/about'];
    default:
      return [];
  }
}
