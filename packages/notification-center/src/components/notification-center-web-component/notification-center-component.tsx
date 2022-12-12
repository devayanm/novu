import React, { FunctionComponent } from 'react';
import { IMessage, MessageActionStatusEnum, ButtonTypeEnum } from '@novu/shared';

import { NovuProvider } from '../novu-provider';
import { PopoverNotificationCenter } from '../popover-notification-center';
import { NotificationBell } from '../notification-bell';
import { useNotifications } from '../../hooks';
import { reactToWebComponent } from '../../utils';
import type { NotificationCenterComponentProps, PopoverWrapperProps } from './notification-center-component.types';

/*
 * This array represents the public API of the web component.
 * All the props defined in the NotificationCenterComponentProps should be added here.
 */
export const NOTIFICATION_CENTER_PROPS = [
  'backendUrl',
  'socketUrl',
  'subscriberId',
  'applicationIdentifier',
  'subscriberHash',
  'stores',
  'tabs',
  'showUserPreferences',
  'popover',
  'theme',
  'styles',
  'colorScheme',
  'i18n',
  'onLoad',
  'sessionLoaded',
  'onNotificationClick',
  'notificationClicked',
  'onUnseenCountChanged',
  'unseenCountChanged',
  'onActionClick',
  'actionClicked',
  'onTabClick',
  'tabClicked',
];

export const NotificationCenterComponent: FunctionComponent<NotificationCenterComponentProps> = ({
  backendUrl,
  socketUrl,
  subscriberId,
  applicationIdentifier,
  subscriberHash,
  stores,
  tabs,
  showUserPreferences,
  popover,
  theme,
  styles,
  colorScheme = 'dark',
  i18n,
  sessionLoaded,
  onLoad = sessionLoaded,
  notificationClicked,
  onNotificationClick = notificationClicked,
  unseenCountChanged,
  onUnseenCountChanged = unseenCountChanged,
  actionClicked,
  onActionClick = actionClicked,
  tabClicked,
  onTabClick = tabClicked,
}) => {
  return (
    <NovuProvider
      onLoad={onLoad}
      stores={stores}
      backendUrl={backendUrl}
      socketUrl={socketUrl}
      subscriberId={subscriberId}
      applicationIdentifier={applicationIdentifier}
      subscriberHash={subscriberHash}
      styles={styles}
      i18n={i18n}
    >
      <PopoverWrapper
        onNotificationClick={onNotificationClick}
        onUnseenCountChanged={onUnseenCountChanged}
        onActionClick={onActionClick}
        onTabClick={onTabClick}
        colorScheme={colorScheme}
        theme={theme}
        tabs={tabs}
        showUserPreferences={showUserPreferences}
        popover={popover}
      />
    </NovuProvider>
  );
};

function PopoverWrapper({
  onNotificationClick,
  onUnseenCountChanged,
  onActionClick,
  onTabClick,
  colorScheme = 'dark',
  theme,
  tabs,
  showUserPreferences,
  popover,
  unseenBadgeColor,
  unseenBadgeBackgroundColor,
}: PopoverWrapperProps) {
  const { updateAction, markAsSeen } = useNotifications();

  function handlerOnNotificationClick(message: IMessage) {
    if (message?.cta?.data?.url) {
      markAsSeen();
    }
    onNotificationClick?.(message);
  }

  async function handlerOnActionClick(templateIdentifier: string, type: ButtonTypeEnum, message: IMessage) {
    await updateAction(message._id, type, MessageActionStatusEnum.DONE);
    onActionClick?.(templateIdentifier, type, message);
  }

  return (
    <PopoverNotificationCenter
      onNotificationClick={handlerOnNotificationClick}
      onUnseenCountChanged={onUnseenCountChanged}
      onActionClick={handlerOnActionClick}
      onTabClick={onTabClick}
      colorScheme={colorScheme}
      theme={theme}
      tabs={tabs}
      showUserPreferences={showUserPreferences}
      offset={popover?.offset}
      position={popover?.position}
    >
      {({ unseenCount }) => (
        <NotificationBell
          colorScheme={colorScheme}
          unseenCount={unseenCount}
          unseenBadgeColor={unseenBadgeColor}
          unseenBadgeBackgroundColor={unseenBadgeBackgroundColor}
        />
      )}
    </PopoverNotificationCenter>
  );
}

export const NotificationCenterWebComponent = reactToWebComponent(NotificationCenterComponent, {
  props: NOTIFICATION_CENTER_PROPS,
});
