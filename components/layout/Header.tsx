'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';

interface NavChild {
  href: string;
  label: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
  dropdownAlign?: 'left' | 'right';
}

const NAV_LEFT: NavItem[] = [
  {
    label: 'About',
    children: [
      { href: '/about', label: 'About & History' },
      { href: '/clergy', label: 'Our Clergy' },
    ],
  },
  {
    label: 'Worship',
    children: [
      { href: '/readings', label: 'Daily Readings' },
      { href: '/schedule', label: 'Parish Schedule' },
      { href: '/livestream', label: 'Livestream' },
    ],
  },
  {
    label: 'Sacraments',
    children: [
      { href: '/sacraments', label: 'Overview' },
      { href: '/sacraments/baptism', label: 'Baptism' },
      { href: '/sacraments/eucharist', label: 'Eucharist' },
      { href: '/sacraments/confirmation', label: 'Confirmation' },
      { href: '/sacraments/reconciliation', label: 'Reconciliation' },
      { href: '/sacraments/anointing', label: 'Anointing' },
      { href: '/sacraments/matrimony', label: 'Matrimony' },
      { href: '/sacraments/rcia', label: 'RCIA / Becoming Catholic' },
    ],
  },
];

const NAV_RIGHT: NavItem[] = [
  {
    label: 'News & Media',
    children: [
      { href: '/announcements', label: 'Announcements' },
      { href: '/homilies', label: 'Homilies' },
      { href: '/gallery', label: 'Gallery' },
    ],
    dropdownAlign: 'right',
  },
  { label: 'Give', href: '/give' },
  { label: 'Contact', href: '/contact' },
];

function isChildActive(child: NavChild, pathname: string): boolean {
  return pathname === child.href || pathname.startsWith(child.href + '/');
}

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href) return pathname === item.href;
  return item.children?.some((c) => isChildActive(c, pathname)) ?? false;
}

export default function Header(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroups, setOpenMobileGroups] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMenuOpen(false);
  }, [pathname]);

  // Close dropdown on click outside the nav
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent): void => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  // Close dropdown on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const closeAll = (): void => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label: string): void => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const toggleMobileGroup = (label: string): void => {
    setOpenMobileGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderDesktopItem = (item: NavItem): React.JSX.Element => {
    const active = isItemActive(item, pathname);

    if (!item.children) {
      return (
        <Link
          key={item.label}
          href={item.href!}
          className={`${styles.header__link} ${active ? styles['header__link--active'] : ''}`}
          onClick={closeAll}
        >
          {item.label}
        </Link>
      );
    }

    const isOpen = openDropdown === item.label;
    const isWide = item.label === 'Sacraments';

    return (
      <div key={item.label} className={styles['header__nav-item']}>
        <button
          type="button"
          className={`${styles.header__link} ${styles['header__link--btn']} ${
            active ? styles['header__link--active'] : ''
          }`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={() => toggleDropdown(item.label)}
        >
          {item.label}
          <span
            className={`${styles.header__chevron} ${isOpen ? styles['header__chevron--open'] : ''}`}
            aria-hidden="true"
          />
        </button>

        <div
          role="menu"
          aria-hidden={!isOpen}
          className={[
            styles.header__dropdown,
            isOpen ? styles['header__dropdown--open'] : '',
            item.dropdownAlign === 'right' ? styles['header__dropdown--right'] : '',
            isWide ? styles['header__dropdown--wide'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
              className={`${styles['header__dropdown-link']} ${
                isChildActive(child, pathname) ? styles['header__dropdown-link--active'] : ''
              }`}
              onClick={closeAll}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderMobileItem = (item: NavItem): React.JSX.Element => {
    const active = isItemActive(item, pathname);

    if (!item.children) {
      return (
        <div key={item.label} className={styles['header__mobile-group']}>
          <Link
            href={item.href!}
            className={`${styles['header__mobile-link']} ${
              active ? styles['header__mobile-link--active'] : ''
            }`}
            onClick={closeAll}
          >
            {item.label}
          </Link>
        </div>
      );
    }

    const isOpen = openMobileGroups.has(item.label);

    return (
      <div key={item.label} className={styles['header__mobile-group']}>
        <button
          type="button"
          className={`${styles['header__mobile-link']} ${styles['header__mobile-link--btn']} ${
            active ? styles['header__mobile-link--active'] : ''
          }`}
          aria-expanded={isOpen}
          onClick={() => toggleMobileGroup(item.label)}
        >
          {item.label}
          <span
            className={`${styles.header__chevron} ${isOpen ? styles['header__chevron--open'] : ''}`}
            aria-hidden="true"
          />
        </button>

        <div
          aria-hidden={!isOpen}
          className={`${styles['header__mobile-children']} ${
            isOpen ? styles['header__mobile-children--open'] : ''
          }`}
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              tabIndex={isOpen ? 0 : -1}
              className={`${styles['header__mobile-child-link']} ${
                isChildActive(child, pathname)
                  ? styles['header__mobile-child-link--active']
                  : ''
              }`}
              onClick={closeAll}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles['header__top-bar']}>
        <div className={styles['header__top-side']}>
          <Image
            src="/icons/ascension_logo_dark.svg"
            alt=""
            width={32}
            height={32}
            className={styles['header__top-logo']}
          />
          <span className={styles['header__top-side-text']}>Catholic Church of the</span>
        </div>
        <Link href="/" className={styles.header__wordmark} onClick={closeAll}>
          Ascension
        </Link>
        <div className={`${styles['header__top-side']} ${styles['header__top-side--right']}`}>
          <span className={styles['header__top-side-text']}>MMIA, Ikeja, Lagos.</span>
          <Image
            src="/icons/ascension_logo_dark.svg"
            alt=""
            width={32}
            height={32}
            className={styles['header__top-logo']}
          />
        </div>
      </div>

      <nav ref={navRef} className={styles['header__nav-bar']} aria-label="Primary">
        <div className={styles['header__links-left']}>{NAV_LEFT.map(renderDesktopItem)}</div>

        <Link href="/" className={`${styles.header__logo} ${styles['header__logo--nav']}`} onClick={closeAll} aria-label="Home">
          <Image src="/icons/ascension_logo_dark.svg" alt="" width={40} height={40} />
        </Link>

        <div className={styles['header__links-right']}>{NAV_RIGHT.map(renderDesktopItem)}</div>

        <button
          type="button"
          className={`${styles['header__menu-toggle']} ${menuOpen ? styles['header__menu-toggle--open'] : ''}`}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles['header__toggle-icons']} aria-hidden="true">
            <svg
              className={styles['header__icon-menu']}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <svg
              className={styles['header__icon-close']}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </nav>

      <div
        id="site-menu"
        className={`${styles.header__menu} ${menuOpen ? styles['header__menu--open'] : ''}`}
        aria-hidden={!menuOpen}
      >
        {[...NAV_LEFT, ...NAV_RIGHT].map(renderMobileItem)}
      </div>
    </header>
  );
}
