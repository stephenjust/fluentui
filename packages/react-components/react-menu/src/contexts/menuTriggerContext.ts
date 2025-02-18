import * as React from 'react';

/**
 * Context used communicate with a child menu item that it is a trigger for a submenu
 */
// eslint-disable-next-line @fluentui/no-context-default-value
const MenuTriggerContext = React.createContext<boolean>(false);

export const MenuTriggerContextProvider = MenuTriggerContext.Provider;
export const useMenuTriggerContext_unstable = () => React.useContext(MenuTriggerContext);
