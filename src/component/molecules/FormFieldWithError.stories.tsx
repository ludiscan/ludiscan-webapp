import { useState } from 'react';

import { FormErrorSummary } from './FormErrorSummary';
import { FormFieldWithError } from './FormFieldWithError';

import type { FormError } from './FormErrorSummary';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@src/component/atoms/Button';


const meta = {
  title: 'Molecules/FormFieldWithError',
  component: FormFieldWithError,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Form field wrapper with accessible error handling, following WCAG 2.2 and Design Implementation Guide.

**Features:**
- Automatic ARIA attribute management (aria-describedby, aria-invalid, aria-required)
- Accessible label-input association
- Optional hint text
- Visual and semantic error indication
- Material Design 3 compliant styling
- Logical properties for RTL/LTR support

**Design Implementation Guide:**
- Rule 7: Individual errors with aria-describedby
- Rule 8: Actionable error messages
- Rule 9: aria-live for dynamic validation

**References:**
- [WCAG 2.2 SC 3.3.1](https://www.w3.org/WAI/WCAG22/quickref/#error-identification)
- [GOV.UK Error Message](https://design-system.service.gov.uk/components/error-message/)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Field label text',
      control: 'text',
    },
    fieldId: {
      description: 'Field ID (auto-generated if not provided)',
      control: 'text',
    },
    error: {
      description: 'Error message (shown when present)',
      control: 'text',
    },
    hint: {
      description: 'Optional hint text',
      control: 'text',
    },
    required: {
      description: 'Whether the field is required',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof FormFieldWithError>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text input
 */
export const Default: Story = {
  args: {
    label: 'Email Address',
    required: true,
    children: <input type='email' placeholder='user@example.com' />,
  },
};

/**
 * With hint text
 */
export const WithHint: Story = {
  args: {
    label: 'Password',
    hint: '8文字以上、数字を含む必要があります',
    required: true,
    children: <input type='password' />,
  },
};

/**
 * With error message
 */
export const WithError: Story = {
  args: {
    label: 'Email Address',
    error: 'メールアドレスに@を含めてください（例: user@example.com）',
    required: true,
    children: <input type='email' value='invalid-email' readOnly />,
  },
};

/**
 * With both hint and error
 */
export const WithHintAndError: Story = {
  args: {
    label: 'Password',
    hint: '8文字以上、数字を含む必要があります',
    error: 'パスワードは8文字以上必要です',
    required: true,
    children: <input type='password' value='short' readOnly />,
  },
};

/**
 * Textarea input
 */
export const TextareaField: Story = {
  args: {
    label: 'Description',
    hint: '最大500文字まで入力できます',
    required: false,
    children: <textarea rows={4} placeholder='説明を入力してください...' />,
  },
};

/**
 * Select input
 */
export const SelectField: Story = {
  args: {
    label: 'Country',
    hint: 'お住まいの国を選択してください',
    required: true,
    children: (
      <select>
        <option value=''>選択してください</option>
        <option value='jp'>日本</option>
        <option value='us'>アメリカ</option>
        <option value='uk'>イギリス</option>
      </select>
    ),
  },
};

/**
 * Optional field (not required)
 */
export const OptionalField: Story = {
  args: {
    label: 'Middle Name',
    hint: '任意項目です',
    required: false,
    children: <input type='text' placeholder='(Optional)' />,
  },
};

/**
 * Disabled field
 */
export const DisabledField: Story = {
  args: {
    label: 'Email Address',
    hint: 'このフィールドは変更できません',
    children: <input type='email' value='locked@example.com' disabled />,
  },
};

/**
 * Interactive validation example
 */
export const InteractiveValidation: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: {} as any,

  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [email, setEmail] = useState('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [password, setPassword] = useState('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
      const newErrors: { email?: string; password?: string } = {};

      if (!email) {
        newErrors.email = 'メールアドレスを入力してください';
      } else if (!email.includes('@')) {
        newErrors.email = 'メールアドレスに@を含めてください（例: user@example.com）';
      }

      if (!password) {
        newErrors.password = 'パスワードを入力してください';
      } else if (password.length < 8) {
        newErrors.password = 'パスワードは8文字以上必要です';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        alert('フォーム送信成功！');
      }
    };

    const formErrors: FormError[] = Object.entries(errors).map(([fieldId, message]) => ({
      fieldId,
      message,
    }));

    return (
      <form>
        <FormErrorSummary errors={formErrors} show={formErrors.length > 0} />

        <FormFieldWithError label='Email Address' fieldId='email' error={errors.email} required>
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} onBlur={validateForm} />
        </FormFieldWithError>

        <FormFieldWithError label='Password' fieldId='password' error={errors.password} hint='8文字以上、数字を含む必要があります' required>
          <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} onBlur={validateForm} />
        </FormFieldWithError>

        <Button scheme='primary' fontSize='base' onClick={handleSubmit}>
          送信
        </Button>
      </form>
    );
  },
};

/**
 * Complete form example with error summary
 */
export const CompleteFormExample: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: {} as any,

  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showErrors, setShowErrors] = useState(true);

    const formErrors: FormError[] = [
      { fieldId: 'username', message: 'ユーザー名を入力してください' },
      { fieldId: 'email', message: 'メールアドレスに@を含めてください（例: user@example.com）' },
      { fieldId: 'password', message: 'パスワードは8文字以上必要です' },
    ];

    return (
      <div>
        <h2>ユーザー登録フォーム</h2>

        <FormErrorSummary errors={formErrors} show={showErrors} />

        <FormFieldWithError label='Username' fieldId='username' error={showErrors ? formErrors[0].message : undefined} required>
          <input type='text' placeholder='Enter your username' />
        </FormFieldWithError>

        <FormFieldWithError
          label='Email Address'
          fieldId='email'
          error={showErrors ? formErrors[1].message : undefined}
          hint="We'll never share your email"
          required
        >
          <input type='email' placeholder='user@example.com' value='invalid' readOnly />
        </FormFieldWithError>

        <FormFieldWithError label='Password' fieldId='password' error={showErrors ? formErrors[2].message : undefined} hint='8文字以上、数字を含む' required>
          <input type='password' value='short' readOnly />
        </FormFieldWithError>

        <FormFieldWithError label='Bio' hint='Tell us about yourself (optional)'>
          <textarea rows={4} placeholder='I am a...' />
        </FormFieldWithError>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button scheme='primary' fontSize='base' onClick={() => setShowErrors(!showErrors)}>
            {showErrors ? 'Hide Errors' : 'Show Errors'}
          </Button>
        </div>
      </div>
    );
  },
};
