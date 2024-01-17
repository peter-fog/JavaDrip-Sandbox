import { FC, ReactNode, createContext, useContext } from 'react';
import SegmentProvider from './SegmentProvider';

export const SegmentDataContext = createContext<SegmentProfile.SegmentData | undefined>(undefined);

interface Props {
  children: ReactNode;
  data?: SegmentProfile.SegmentData;
}

const SegmentDataContextProvider: FC<Props> = ({ children, data }) => (
  <SegmentDataContext.Provider value={data}>
    <SegmentProvider />
    {children}
  </SegmentDataContext.Provider>
);

export default SegmentDataContextProvider;

export const useSegmentDataContext = () => useContext(SegmentDataContext);
