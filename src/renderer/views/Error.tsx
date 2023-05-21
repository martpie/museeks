import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import ExternalLink from '../elements/ExternalLink/ExternalLink';

export default function Error() {
  const error = useRouteError();
  let message = 'Unknown error';

  if (isRouteErrorResponse(error)) {
    message = error.statusText;
  }

  return (
    <ViewMessage.Notice>
      <p>
        <span role='img' aria-label='boom'>
          💥
        </span>{' '}
        Navigation error: {message}
      </p>
      <ViewMessage.Sub>
        If it happens again, please{' '}
        <ExternalLink href='https://github.com/martpie/museeks/issues'>report an issue</ExternalLink>
      </ViewMessage.Sub>
    </ViewMessage.Notice>
  );
}
