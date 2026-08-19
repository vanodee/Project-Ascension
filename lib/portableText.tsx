import type { PortableTextComponents } from '@portabletext/react';

export { toPlainText } from '@portabletext/react';

/** PortableText components that render every paragraph with a single className. */
export function paragraphComponents(paragraphClassName: string | undefined): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className={paragraphClassName}>{children}</p>,
    },
  };
}
