import * as React from 'react';

/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
*/

interface Props {
  type: string;
  content: string;
}

const ToastItem: React.FunctionComponent<Props> = (props) => {
  const { type, content } = props;

  return (
    <div className={`alert alert-${type}`}>
      {content}
    </div>
  );
};

export default ToastItem;
