import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Initial mock notifications
const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Nouveau client inscrit',
    message: 'Jean-Paul Ekedi vient de créer un compte',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    link: '/dashboard/nouveaux'
  },
  {
    id: 'n2',
    title: 'Dossier transmis',
    message: 'Le dossier de Marie Ngono a été transmis au comité',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    link: '/dashboard/comite'
  },
  {
    id: 'n3',
    title: 'Client réassigné',
    message: 'Pierre Atangana a été transféré à Nana Landre',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
  {
    id: 'n4',
    title: 'Nouveau message',
    message: 'Samuel Fotso souhaite vous contacter pour un prêt',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: false,
    link: '/dashboard/agenda'
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n_${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
