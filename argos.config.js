/**
 * Argos CI Configuration
 *
 * This configuration enables visual regression testing for the Storybook
 * by uploading screenshots to Argos on each pull request.
 *
 * @see https://argos-ci.com/docs
 */

export default {
  // Upload Storybook build output
  upload: {
    // Path to the built Storybook static files
    path: './storybook-static',

    // Optional: Configure which files to include/exclude
    // ignore: ['**/node_modules/**'],
  },

  // Optional: Configure screenshot comparison settings
  // threshold: 0.5, // Sensitivity for detecting visual changes (0-1)

  // Optional: Configure which branches to compare against
  // reference: {
  //   branch: 'main',
  // },
};
