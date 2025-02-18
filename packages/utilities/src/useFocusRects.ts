import * as React from 'react';
import { getWindow } from './dom/getWindow';
import { isDirectionalKeyCode } from './keyboard';
import { setFocusVisibility } from './setFocusVisibility';

/**
 * Counter for mounted component that uses focus rectangles.
 * We want to cleanup the listeners before the last component that uses focus rectangles unmounts.
 */
export type ListenerCallbacks = {
  onMouseDown: (ev: MouseEvent) => void;
  onPointerDown: (ev: PointerEvent) => void;
  onKeyDown: (ev: KeyboardEvent) => void;
  onKeyUp: (ev: KeyboardEvent) => void;
};
let mountCounters = new WeakMap<Window | HTMLElement, number>();
let callbackMap = new WeakMap<HTMLElement, ListenerCallbacks>();

function setMountCounters(key: Window | HTMLElement, delta: number): number {
  let newValue;
  const currValue = mountCounters.get(key);
  if (currValue) {
    newValue = currValue + delta;
  } else {
    newValue = 1;
  }

  mountCounters.set(key, newValue);
  return newValue;
}

function setCallbackMap(key: HTMLElement): ListenerCallbacks {
  let callbacks = callbackMap.get(key);
  if (callbacks) {
    return callbacks;
  }

  const onMouseDown = (ev: MouseEvent) => _onMouseDown(ev, key);
  const onPointerDown = (ev: PointerEvent) => _onPointerDown(ev, key);
  const onKeyDown = (ev: KeyboardEvent) => _onKeyDown(ev, key);
  const onKeyUp = (ev: KeyboardEvent) => _onKeyUp(ev, key);
  callbacks = { onMouseDown, onPointerDown, onKeyDown, onKeyUp };

  callbackMap.set(key, callbacks);
  return callbacks;
}

type AppWindow = (Window & { FabricConfig?: { disableFocusRects?: boolean } }) | undefined;

export type IFocusRectsContext = {
  providerRef?: React.RefObject<HTMLElement>;
};
export const FocusRectsContext = React.createContext<IFocusRectsContext>({});
export const FocusRectsProvider = FocusRectsContext.Provider;

/**
 * Initializes the logic which:
 *
 * 1. Subscribes keydown and mousedown events. (It will only do it once per window,
 *    so it's safe to call this method multiple times.)
 * 2. When the user presses directional keyboard keys, adds the 'ms-Fabric--isFocusVisible' classname
 *    to the document body, removes the 'ms-Fabric-isFocusHidden' classname.
 * 3. When the user clicks a mouse button, adds the 'ms-Fabric-isFocusHidden' classname to the
 *    document body, removes the 'ms-Fabric--isFocusVisible' classname.
 *
 * This logic allows components on the page to conditionally render focus treatments based on
 * the existence of global classnames, which simplifies logic overall.
 *
 * @param rootRef - A Ref object. Focus rectangle can be applied on itself and all its children.
 */
export function useFocusRects(rootRef?: React.RefObject<HTMLElement>): void {
  const { providerRef } = React.useContext(FocusRectsContext);

  React.useEffect(() => {
    const win = getWindow(rootRef?.current) as AppWindow;

    if (!win || win.FabricConfig?.disableFocusRects === true) {
      return undefined;
    }

    let el: Window | HTMLElement = win;
    let onMouseDown: (ev: MouseEvent) => void;
    let onPointerDown: (ev: PointerEvent) => void;
    let onKeyDown: (ev: KeyboardEvent) => void;
    let onKeyUp: (ev: KeyboardEvent) => void;
    if (providerRef && providerRef.current) {
      el = providerRef.current;
      const callbacks = setCallbackMap(el as HTMLElement);
      onMouseDown = callbacks.onMouseDown;
      onPointerDown = callbacks.onPointerDown;
      onKeyDown = callbacks.onKeyDown;
      onKeyUp = callbacks.onKeyUp;
    } else {
      onMouseDown = _onMouseDown;
      onPointerDown = _onPointerDown;
      onKeyDown = _onKeyDown;
      onKeyUp = _onKeyUp;
    }

    let count = setMountCounters(el, 1);
    if (count <= 1) {
      el.addEventListener('mousedown', onMouseDown, true);
      el.addEventListener('pointerdown', onPointerDown, true);
      el.addEventListener('keydown', onKeyDown, true);
      el.addEventListener('keyup', onKeyUp, true);
    }

    return () => {
      if (!win || win.FabricConfig?.disableFocusRects === true) {
        return;
      }
      count = setMountCounters(el, -1);
      if (count === 0) {
        el.removeEventListener('mousedown', onMouseDown, true);
        el.removeEventListener('pointerdown', onPointerDown, true);
        el.removeEventListener('keydown', onKeyDown, true);
        el.removeEventListener('keyup', onKeyUp, true);
      }
    };
  }, [providerRef, rootRef]);
}

/**
 * Function Component wrapper which enables calling `useFocusRects` hook.
 * Renders nothing.
 */
export const FocusRects: React.FunctionComponent<{ rootRef?: React.RefObject<HTMLElement> }> = props => {
  useFocusRects(props.rootRef);
  return null;
};

function _onMouseDown(ev: MouseEvent, providerElem?: Element): void {
  setFocusVisibility(false, ev.target as Element, providerElem);
}

function _onPointerDown(ev: PointerEvent, providerElem?: Element): void {
  if (ev.pointerType !== 'mouse') {
    setFocusVisibility(false, ev.target as Element, providerElem);
  }
}

// You need both a keydown and a keyup listener that sets focus visibility to true to handle two distinct scenarios when
// attaching the listeners and classnames to the provider instead of the document body.
// If you only have a keydown listener, then the focus rectangles will not show when moving from outside of the provider
// to inside it. That is why a keyup listener is needed, since it will always trigger after the focus event is fired.
// If you only have a keyup listener, then the focus rectangles will not show moving between different tabbable elements
// if the tab key is pressed without being released. That's is why we need a keydown listener, since it will trigger for
// every element that is being tabbed into.
// This works because `classList.add` is smart and will not duplicate a classname that already exists on the classList
// when focus visibility is turned on.
function _onKeyDown(ev: KeyboardEvent, providerElem?: Element): void {
  // eslint-disable-next-line deprecation/deprecation
  if (isDirectionalKeyCode(ev.which)) {
    setFocusVisibility(true, ev.target as Element, providerElem);
  }
}

function _onKeyUp(ev: KeyboardEvent, providerElem?: Element): void {
  // eslint-disable-next-line deprecation/deprecation
  if (isDirectionalKeyCode(ev.which)) {
    setFocusVisibility(true, ev.target as Element, providerElem);
  }
}
