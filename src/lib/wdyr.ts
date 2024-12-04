import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const { default: whyDidYouRender } = await import(
    '@welldone-software/why-did-you-render'
  );

  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
  });
}
