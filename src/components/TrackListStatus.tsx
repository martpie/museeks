import { Plural } from '@lingui/react/macro';

import useFormattedDuration from '../hooks/useFormattedDuration';
import type { TrackListStatusInfo } from '../types/museeks';

export default function TrackListStatus(props: TrackListStatusInfo) {
  const duration = useFormattedDuration(props.duration);

  return (
    <>
      {props.count} <Plural value={props.count} one="track" other="tracks" />,{' '}
      {duration}
    </>
  );
}
