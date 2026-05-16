import { render } from '@testing-library/react';
import React from 'react';

import { JsonLd } from './JsonLd';

// Mock Next.js Head component so that it renders its children into the DOM
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  };
});

describe('JsonLd', () => {
  it('escapes `<` characters to prevent XSS', () => {
    const maliciousSchema = {
      type: 'Organization' as const,
      name: 'Malicious </script><script>alert(1)</script>',
      url: 'https://example.com',
    };

    const { container } = render(<JsonLd schema={maliciousSchema} />);

    // Find the script tag
    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).not.toBeNull();

    const scriptContent = scriptTag?.innerHTML;
    expect(scriptContent).toBeDefined();

    // Verify the output doesn't contain unescaped `<`
    expect(scriptContent).not.toContain('<');

    // Verify it contains the escaped version
    expect(scriptContent).toContain('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>');

    // Verify it's still valid JSON
    const parsed = JSON.parse(scriptContent as string);
    expect(parsed.name).toBe('Malicious </script><script>alert(1)</script>');
  });

  it('renders standard schema properties correctly', () => {
    const schema = {
      type: 'WebSite' as const,
      name: 'Test Site',
      url: 'https://example.com',
    };

    const { container } = render(<JsonLd schema={schema} />);
    const scriptContent = container.querySelector('script[type="application/ld+json"]')?.innerHTML;

    expect(scriptContent).toBeDefined();
    const parsed = JSON.parse(scriptContent as string);
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.name).toBe('Test Site');
    expect(parsed.url).toBe('https://example.com');
  });
});
