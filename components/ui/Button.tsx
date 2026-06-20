import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'ghost-inverse' | 'outline';
type ButtonSize = 'lg' | 'sm';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles['button--primary'] ?? '',
  'ghost-inverse': styles['button--ghost-inverse'] ?? '',
  outline: styles['button--outline'] ?? '',
};

const sizeClass: Record<ButtonSize, string> = {
  lg: styles['button--lg'] ?? '',
  sm: styles['button--sm'] ?? '',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  href,
  type = 'button',
  onClick,
  disabled,
}: ButtonProps): React.JSX.Element {
  const className = `${styles.button} ${variantClass[variant]} ${sizeClass[size]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
