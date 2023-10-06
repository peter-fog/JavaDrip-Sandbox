import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import { useSegmentDataContext } from './SegmentDataProvider';

const Profile = dynamic(() => import('./Profile').then(mod => mod.default), { ssr: false });

const ProfileContent: FC = () => {
  const data = useSegmentDataContext();

  return <Profile segmentData={data} />;
};

registerUniformComponent({
  type: 'profileContent',
  component: ProfileContent,
});

export default ProfileContent;
