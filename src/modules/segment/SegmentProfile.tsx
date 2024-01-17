import { FC, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import Image from '../../components/Image';
import classNames from 'classnames';
import { useScores, useQuirks } from '@uniformdev/context-react';
import Trackers from './Trackers';
import OverrideAnonymousId from './OverrideAnonymousId';
import InformationContent from '../../components/InformationContent';
import { useSegmentDataContext } from './SegmentDataProvider';
import { STORE_ANONYMOUS_ID_COOKIE_NAME, STORE_USER_COOKIE_NAME } from './constants';

type Styles = {
  container?: string;
};

export type SegmentProfileProps = {
  styles?: Styles;
};

const NEXT_PUBLIC_ANALYTICS_WRITE_KEY = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;

const SegmentProfile: FC<SegmentProfileProps> = ({ styles }) => {
  const segmentData = useSegmentDataContext();
  const scores = useScores();
  const quirks = useQuirks();

  const [cookies] = useCookies();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isAnonymousUser = useMemo(() => !cookies[STORE_USER_COOKIE_NAME], []);

  const scoresForDisplay = useMemo(() => Object.entries(scores), [scores]);
  const quirksForDisplay = useMemo(() => Object.entries(quirks), [quirks]);

  if (!NEXT_PUBLIC_ANALYTICS_WRITE_KEY) {
    return (
      <div className="my-auto">
        <InformationContent
          title="Segment is not configured"
          text="Please provide correct env variables"
          className="text-secondary-content"
        />
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col gap-10 text-secondary-content', styles?.container)}>
      {isAnonymousUser && (
        <div className="flex flex-col gap-8">
          <div>
            <p className="font-normal uppercase mb-2">Anonymous User</p>
            <div className="flex flex-row gap-4">
              <Image
                src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282972/csk-icons/icon-profile_kdp16b_stik6h.svg"
                width={50}
                height={50}
                alt="profile icon"
                unoptimized
              />
              <div>
                <p className="font-bold text-1xl">anonymous_id</p>
                <p className="font-bold text-gray-600">{cookies[STORE_ANONYMOUS_ID_COOKIE_NAME]}</p>
              </div>
            </div>
          </div>
          <OverrideAnonymousId />
        </div>
      )}
      <hr />
      <div>
        <p className="text-3xl">Uniform Tracker</p>
        <p className="font-normal uppercase mt-6">Current visitor scores</p>
        <Trackers trackersName="scores" trackers={scoresForDisplay} />

        <p className="font-normal uppercase mt-8">Current visitor quirks</p>
        <Trackers trackersName="quirks" trackers={quirksForDisplay} />
      </div>
      <hr />
      <div>
        <p className="text-3xl">Segment</p>
        <p className="font-normal uppercase mt-6">Current visitor traits</p>
        <Trackers trackersName="traits" trackers={Object.entries(segmentData?.traits || {})} />
      </div>
    </div>
  );
};

export default SegmentProfile;
