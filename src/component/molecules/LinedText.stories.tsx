import { within, expect } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/react';

import { LinedText } from '@src/component/molecules/LinedText';

export default {
  component: LinedText,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof LinedText>;
const Template: Story = {
  render: (args) => {
    return <LinedText {...args} />;
  },
};
export const Default: Story = {
  ...Template,
  name: 'default style',
  args: { text: 'または' },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    await step('テキストが表示される', async () => {
      await expect(await c.findByText('または')).toBeInTheDocument();
    });
    await step('リンクではない', async () => {
      expect(c.queryByRole('link', { name: 'または' })).toBeNull();
    });
  },
};

// リンクとして描画されるパターン
export const AsLink: Story = {
  ...Template,
  name: 'as link',
  args: {
    text: 'ドキュメントへ',
    href: '/docs',
  },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    const link = await c.findByRole('link', { name: 'ドキュメントへ' });
    await step('target と rel の既定値を確認', async () => {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    });
  },
};

// コンテナ幅いっぱいに水平線を伸ばす
export const FullWidth: Story = {
  ...Template,
  name: 'full width (horizontal)',
  args: {
    text: 'ヘッダー',
    fullWidth: true,
  },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    const inner = await c.findByText('ヘッダー');
    const wrapper = inner.parentElement as HTMLElement; // HorizontalWrapper
    await step('display が flex（伸縮レイアウト）になる', async () => {
      const style = getComputedStyle(wrapper);
      expect(style.display).toBe('flex');
    });
  },
};

// 垂直線（左右に細い縦線）
export const Vertical: Story = {
  ...Template,
  name: 'vertical',
  args: {
    text: '縦線',
    orientation: 'vertical',
  },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    const inner = await c.findByText('縦線');
    const wrapper = inner.parentElement as HTMLElement; // VerticalWrapper
    await step('display が inline-flex（インライン要素として整列）', async () => {
      const style = getComputedStyle(wrapper);
      expect(style.display).toBe('inline-flex');
    });
  },
};

// 片側だけ線（見た目確認用）
export const LeftOnly: Story = {
  ...Template,
  name: 'left only line',
  args: {
    text: '左のみ',
    side: 'left',
  },
};

export const RightOnly: Story = {
  ...Template,
  name: 'right only line',
  args: {
    text: '右のみ',
    side: 'right',
  },
};

// className の伝播確認（外側 wrapper / 内側 Text）
export const ClassNameForwarding: Story = {
  ...Template,
  name: 'className forwarding',
  args: {
    text: 'className',
    className: 'outer-class',
    textClassName: 'inner-class',
  },
  play: async ({ canvasElement, step }) => {
    const c = within(canvasElement);
    const inner = await c.findByText('className'); // <span> or <a>
    const wrapper = inner.parentElement as HTMLElement;
    await step('内側に textClassName が付与される', async () => {
      expect(inner).toHaveClass('inner-class');
    });
    await step('外側 wrapper に className が付与される', async () => {
      expect(wrapper).toHaveClass('outer-class');
    });
  },
};
