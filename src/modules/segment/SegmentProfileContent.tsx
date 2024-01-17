import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';

const SegmentProfile = dynamic(() => import('./SegmentProfile').then(mod => mod.default), { ssr: false });

const SegmentProfileContent: FC = props => <SegmentProfile {...props} />;

registerUniformComponent({
  type: 'segmentProfileContent',
  component: SegmentProfileContent,
});

export default SegmentProfileContent;
