import type { CompiledStyles, StyleXArray } from '@stylexjs/stylex';

declare module 'react' {
  interface DOMAttributes<T> {
    sx?: StyleXArray<null | undefined | CompiledStyles | boolean>;
  }
}
