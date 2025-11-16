/**
 * Style Dictionary Configuration
 * Generates design tokens for Web (CSS Custom Properties)
 * Following Material Design 3 and WCAG 2.2 guidelines
 */

module.exports = {
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/tokens/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/styles/tokens/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
          options: {
            outputReferences: false,
          },
        },
      ],
    },
  },
};
