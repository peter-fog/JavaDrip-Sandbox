import { FC } from 'react';
import dynamic from 'next/dynamic';
import { registerUniformComponent } from '@uniformdev/canvas-react';
import { ProfileIconProps } from './ProfileIcon';

const ProfileIcon = dynamic(() => import('./ProfileIcon').then(mod => mod.default), { ssr: false });

const ProfileIconContent: FC<ProfileIconProps> = props => <ProfileIcon {...props} />;

registerUniformComponent({
  type: 'profileIcon',
  component: ProfileIconContent,
});

export default ProfileIconContent;
