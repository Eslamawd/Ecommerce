export type AppNotification = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type NotificationsUnreadPayload = {
  data: AppNotification[];
  count: number;
};
