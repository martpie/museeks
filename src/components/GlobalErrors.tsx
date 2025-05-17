/**
 * Components helpers
 */

import { type ErrorComponentProps, useLocation } from '@tanstack/react-router';
import * as logger from '@tauri-apps/plugin-log';
import ExternalLink from '../elements/ExternalLink';
import * as ViewMessage from '../elements/ViewMessage';

export function ErrorView(props: ErrorComponentProps) {
  const error = props.error;
  let errorMessage: string;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  logger.error(errorMessage);

  return (
    <ViewMessage.Notice>
      <p>
        <span role="img" aria-label="boom">
          💥
        </span>{' '}
        Something wrong happened: {errorMessage}
      </p>
      <Issue />
    </ViewMessage.Notice>
  );
}

export function NotFoundView() {
  const location = useLocation();
  logger.error(`View not found: ${location.pathname}`);

  return (
    <ViewMessage.Notice>
      <p>
        <span role="img" aria-label="how?">
          🤔
        </span>{' '}
        View not found. How did you get there?
      </p>
      <Issue />
    </ViewMessage.Notice>
  );
}

function Issue() {
  return (
    <ViewMessage.Sub>
      If it happens again, please{' '}
      <ExternalLink href="https://github.com/martpie/museeks/issues" type="url">
        report an issue
      </ExternalLink>
    </ViewMessage.Sub>
  );
}
