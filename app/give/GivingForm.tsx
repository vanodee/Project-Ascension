'use client';

import { useState } from 'react';
import Script from 'next/script';
import type { DonationCategory } from '@/lib/types';
import styles from './GivingForm.module.scss';

interface GivingFormProps {
  categories: DonationCategory[];
}

interface PaystackPopInterface {
  setup(options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    metadata: Record<string, unknown>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }): { openIframe: () => void };
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopInterface;
  }
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 25000];

/**
 * Giving form using Paystack Popup JS (inline, not redirect — per the PRD).
 * Name and email are optional to support anonymous giving. While no public
 * key is configured, a mock success path stands in for the popup.
 */
export default function GivingForm({ categories }: GivingFormProps): React.JSX.Element {
  const [category, setCategory] = useState(categories[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('');

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
  const amountNumber = Number(amount);
  const isValidAmount = Number.isFinite(amountNumber) && amountNumber >= 100;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isValidAmount) return;

    const donationRef = `ASC-${Date.now()}`;

    if (publicKey && window.PaystackPop) {
      // Anonymous giving still requires an email for Paystack; use a parish
      // placeholder so the transaction completes with a generated reference.
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email || 'anonymous@ascensioncatholicikeja.org',
        amount: Math.round(amountNumber * 100),
        currency: 'NGN',
        ref: donationRef,
        metadata: { category, donor_name: name || 'Anonymous' },
        callback: (response) => {
          setReference(response.reference);
          setStatus('success');
        },
        onClose: () => {
          // Donor dismissed the popup — no state change needed.
        },
      });
      handler.openIframe();
      return;
    }

    // Mock path until the Paystack public key is configured.
    setReference(donationRef);
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className={styles.form__thanks}>
        <p className={styles['form__thanks-label']}>Thank You</p>
        <h2 className={styles['form__thanks-title']}>God bless your generosity</h2>
        <p className={styles['form__thanks-text']}>
          Your gift has been received{name ? `, ${name}` : ''}. Reference:{' '}
          <strong>{reference}</strong>.
          {publicKey
            ? ''
            : ' (Demo mode — no payment was processed. Donations go live once the parish Paystack key is configured.)'}
        </p>
        <button
          type="button"
          className={styles['form__thanks-again']}
          onClick={() => {
            setStatus('idle');
            setAmount('');
          }}
        >
          Make Another Gift
        </button>
      </div>
    );
  }

  return (
    <>
      {publicKey ? (
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.form__fieldset}>
          <legend className={styles.form__legend}>Donation Category</legend>
          <div className={styles.form__categories}>
            {categories.map((option) => (
              <label
                key={option.id}
                className={`${styles.form__category} ${
                  category === option.id ? styles['form__category--active'] : ''
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={option.id}
                  checked={category === option.id}
                  onChange={() => setCategory(option.id)}
                  className={styles['form__category-input']}
                />
                <span className={styles['form__category-label']}>{option.label}</span>
                <span className={styles['form__category-description']}>
                  {option.description}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.form__field}>
          <label htmlFor="give-amount" className={styles.form__label}>
            Amount (₦)
          </label>
          <div className={styles.form__presets}>
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`${styles.form__preset} ${
                  amount === String(preset) ? styles['form__preset--active'] : ''
                }`}
                onClick={() => setAmount(String(preset))}
              >
                ₦{preset.toLocaleString('en-NG')}
              </button>
            ))}
          </div>
          <input
            id="give-amount"
            type="number"
            min={100}
            step={100}
            required
            placeholder="Enter custom amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={styles.form__input}
          />
        </div>

        <div className={styles.form__row}>
          <div className={styles.form__field}>
            <label htmlFor="give-name" className={styles.form__label}>
              Name <span className={styles.form__optional}>(optional)</span>
            </label>
            <input
              id="give-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Anonymous"
              className={styles.form__input}
            />
          </div>
          <div className={styles.form__field}>
            <label htmlFor="give-email" className={styles.form__label}>
              Email <span className={styles.form__optional}>(optional)</span>
            </label>
            <input
              id="give-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="For your receipt"
              className={styles.form__input}
            />
          </div>
        </div>

        <button type="submit" className={styles.form__submit} disabled={!isValidAmount}>
          Give Now
        </button>
        <p className={styles.form__note}>
          Giving is processed securely by Paystack. Anonymous gifts are welcome — your
          name and email are never required.
        </p>
      </form>
    </>
  );
}
