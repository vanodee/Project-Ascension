import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { getDonationCategories } from '@/lib/donations';
import GivingForm from './GivingForm';
import styles from './page.module.scss';

// SSG — the page shell is static; the form is a client island (Paystack popup).
// Route is disabled (retired from navigation) — remove the notFound() guard to re-enable.

export const metadata: Metadata = {
  title: 'Give',
  description:
    'Support the mission of the Catholic Church of the Ascension, Ikeja, Lagos — give securely online through Paystack, anonymously if you wish.',
};

export default async function GivePage(): Promise<React.JSX.Element> {
  notFound();
  const donationCategories = await getDonationCategories();
  return (
    <div className={styles.give}>
      <PageHeader
        eyebrow="Stewardship & Giving"
        title="Support the Mission"
        description="Your generosity sustains the life and ministry of our parish community — from the celebration of the sacraments to outreach for those most in need. Every gift, great or small, is an act of worship."
      />
      <div className={styles.give__form}>
        <GivingForm categories={donationCategories} />
      </div>
      <p className={styles.give__scripture}>
        “Each of you should give what you have decided in your heart to give, not
        reluctantly or under compulsion, for God loves a cheerful giver.”
        <span className={styles['give__scripture-ref']}> — 2 Corinthians 9:7</span>
      </p>
    </div>
  );
}
