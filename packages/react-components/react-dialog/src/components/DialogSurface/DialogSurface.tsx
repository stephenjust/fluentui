import * as React from 'react';
import { useDialogSurface_unstable } from './useDialogSurface';
import { renderDialogSurface_unstable } from './renderDialogSurface';
import { useDialogSurfaceStyles_unstable } from './useDialogSurfaceStyles';
import type { DialogSurfaceProps } from './DialogSurface.types';
import type { ForwardRefComponent } from '@fluentui/react-utilities';

/**
 * DialogSurface component represents the visual part of a `Dialog` as a whole,
 * it contains everything that should be visible.
 */
export const DialogSurface: ForwardRefComponent<DialogSurfaceProps> = React.forwardRef((props, ref) => {
  const state = useDialogSurface_unstable(props, ref);

  useDialogSurfaceStyles_unstable(state);
  return renderDialogSurface_unstable(state);
});

DialogSurface.displayName = 'DialogSurface';
