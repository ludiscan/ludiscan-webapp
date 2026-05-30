import { JsonLd } from './JsonLd';

describe('JsonLd', () => {
  it('escapes `<` characters to prevent XSS', () => {
    const maliciousSchema = {
      type: 'Organization' as const,
      name: 'Malicious </script><script>alert(1)</script>',
      url: 'https://example.com',
    };

    const element = JsonLd({ schema: maliciousSchema });

    // element is <Head><script .../></Head>
    const scriptElement = element.props.children;
    expect(scriptElement.type).toBe('script');

    const htmlContent = scriptElement.props.dangerouslySetInnerHTML.__html;

    // Verify the output doesn't contain unescaped `<`
    expect(htmlContent).not.toContain('<');

    // Verify it contains the escaped version
    expect(htmlContent).toContain('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>');

    // Verify it's still valid JSON
    const parsed = JSON.parse(htmlContent as string);
    expect(parsed.name).toBe('Malicious </script><script>alert(1)</script>');
  });

  it('renders standard schema properties correctly', () => {
    const schema = {
      type: 'WebSite' as const,
      name: 'Test Site',
      url: 'https://example.com',
    };

    const element = JsonLd({ schema });
    const scriptElement = element.props.children;
    const htmlContent = scriptElement.props.dangerouslySetInnerHTML.__html;

    expect(htmlContent).toBeDefined();
    const parsed = JSON.parse(htmlContent as string);
    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.name).toBe('Test Site');
    expect(parsed.url).toBe('https://example.com');
  });
});
