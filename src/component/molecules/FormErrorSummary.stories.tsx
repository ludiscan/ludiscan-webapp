import { FormErrorSummary } from './FormErrorSummary';

import type { FormError } from './FormErrorSummary';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Molecules/FormErrorSummary',
  component: FormErrorSummary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Form error summary component following GOV.UK Design System and WCAG 2.2 guidelines.

**Features:**
- Accessible error announcement with \`role="alert"\`
- Automatic focus management
- Links to error fields for easy navigation
- Material Design 3 compliant styling
- Logical properties for RTL/LTR support

**Design Implementation Guide:**
- Rule 7: エラーは要約→詳細の順で構造化
- Rule 8: エラーメッセージは行動を明示
- Rule 4: 論理プロパティで物理方向依存を排除

**References:**
- [GOV.UK Error Summary](https://design-system.service.gov.uk/components/error-summary/)
- [WCAG 2.2 SC 3.3.1](https://www.w3.org/WAI/WCAG22/quickref/#error-identification)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    errors: {
      description: 'List of form errors with field IDs and actionable messages',
      control: 'object',
    },
    show: {
      description: 'Whether to display the error summary',
      control: 'boolean',
    },
    title: {
      description: 'Error summary title',
      control: 'text',
    },
    onShow: {
      description: 'Callback when the summary is shown',
      action: 'onShow',
    },
  },
} satisfies Meta<typeof FormErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleErrors: FormError[] = [
  {
    fieldId: 'email',
    message: 'メールアドレスに@を含めてください（例: user@example.com）',
  },
  {
    fieldId: 'password',
    message: 'パスワードは8文字以上必要です',
  },
  {
    fieldId: 'confirm-password',
    message: 'パスワードが一致しません',
  },
];

/**
 * Default error summary with multiple errors
 */
export const Default: Story = {
  args: {
    errors: sampleErrors,
    show: true,
    title: '以下の問題を修正してください',
  },
};

/**
 * Single error
 */
export const SingleError: Story = {
  args: {
    errors: [
      {
        fieldId: 'email',
        message: 'メールアドレスに@を含めてください（例: user@example.com）',
      },
    ],
    show: true,
  },
};

/**
 * Custom title
 */
export const CustomTitle: Story = {
  args: {
    errors: sampleErrors,
    show: true,
    title: 'フォームに問題があります',
  },
};

/**
 * Hidden (show = false)
 */
export const Hidden: Story = {
  args: {
    errors: sampleErrors,
    show: false,
  },
};

/**
 * English error messages
 */
export const EnglishMessages: Story = {
  args: {
    errors: [
      {
        fieldId: 'email',
        message: 'Enter a valid email address (e.g., user@example.com)',
      },
      {
        fieldId: 'password',
        message: 'Password must be at least 8 characters long',
      },
    ],
    show: true,
    title: 'There are problems with your submission',
  },
};

/**
 * Long error messages (testing line wrapping)
 */
export const LongMessages: Story = {
  args: {
    errors: [
      {
        fieldId: 'description',
        message: '説明文は最大500文字までです。現在の文字数は650文字です。150文字削減してください。重要な情報のみを含めるようにしてください。',
      },
      {
        fieldId: 'terms',
        message: '利用規約とプライバシーポリシーの両方に同意する必要があります。チェックボックスを確認してください。',
      },
    ],
    show: true,
  },
};

/**
 * Interactive example with form fields
 */
export const WithFormFields: Story = {
  args: {
    errors: sampleErrors,
    show: true,
  },
  render: (args) => (
    <div>
      <FormErrorSummary {...args} />

      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='email' style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            type='email'
            id='email'
            aria-invalid='true'
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px solid #DC143C',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='password' style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            type='password'
            id='password'
            aria-invalid='true'
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px solid #DC143C',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor='confirm-password' style={{ display: 'block', marginBottom: '0.5rem' }}>
            Confirm Password
          </label>
          <input
            type='password'
            id='confirm-password'
            aria-invalid='true'
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px solid #DC143C',
              borderRadius: '4px',
            }}
          />
        </div>
      </form>
    </div>
  ),
};
