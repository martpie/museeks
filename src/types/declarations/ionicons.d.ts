import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': IoniconElement;
    }
  }
}

type IoniconElement = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    icon: string;
    class?: string;
    style?: React.CSSProperties;
  },
  HTMLElement
>;
