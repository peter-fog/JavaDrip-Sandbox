import { FC } from 'react';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import BaseRichText, { RichTextVariants, RichTextProps } from '../../canvas/RichText';

const RichText: FC<RichTextProps> = props => (
  <BaseRichText
    {...props}
    styles={{
      content: 'font-sans',
    }}
  />
);

[undefined, RichTextVariants.Light].forEach(variantId =>
  registerUniformComponent({
    type: 'richText',
    component: RichText,
    variantId,
  })
);
