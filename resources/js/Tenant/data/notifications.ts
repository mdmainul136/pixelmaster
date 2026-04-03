// Stub: notifications — removed during sGTM cleanup
export type Notification = { id: string; title: string; message: string; read: boolean; createdAt: string };
const EMPTY_NOTIFICATIONS: Notification[] = [];
export const getNotifications = (): Notification[] => EMPTY_NOTIFICATIONS;
export const subscribe = (_cb: () => void) => () => {};
export const markAsRead = (_id: string) => {};
export const markAllAsRead = () => {};
export const deleteNotification = (_id: string) => {};
