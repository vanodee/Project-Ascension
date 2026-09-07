interface JsonLdProps {
  /** One schema.org node, or several to emit together. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders a `<script type="application/ld+json">` tag. `<` is escaped so a string
 * value can never close the script element early (the only XSS vector for
 * JSON-in-a-script-tag); everything else is plain `JSON.stringify` output.
 */
export default function JsonLd({ data }: JsonLdProps): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
