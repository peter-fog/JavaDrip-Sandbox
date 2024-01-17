import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';

const UserProfile = dynamic(() => import('./UserProfile').then(mod => mod.default), { ssr: false });

const UserProfileContent: FC = props => <UserProfile {...props} />;

registerUniformComponent({
  type: 'userProfileContent',
  component: UserProfileContent,
});

export default UserProfileContent;
