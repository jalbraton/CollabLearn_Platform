'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection handlers
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      onError?.(error);
    });

    return () => {
      socket.disconnect();
    };
  }, [autoConnect, onConnect, onDisconnect, onError]);

  const joinPage = (pageId: string) => {
    socketRef.current?.emit('page:join', pageId);
  };

  const leavePage = (pageId: string) => {
    socketRef.current?.emit('page:leave', pageId);
  };

  const emitPageEdit = (pageId: string, content: string) => {
    socketRef.current?.emit('page:edit', { pageId, content });
  };

  const emitCursorUpdate = (pageId: string, position: any) => {
    socketRef.current?.emit('cursor:update', { pageId, position });
  };

  const onPageUpdate = (callback: (data: { pageId: string; content: string; userId: string }) => void) => {
    socketRef.current?.on('page:update', callback);
    return () => {
      socketRef.current?.off('page:update', callback);
    };
  };

  const onUserJoined = (callback: (data: { userId: string; userName: string; pageId: string }) => void) => {
    socketRef.current?.on('user:joined', callback);
    return () => {
      socketRef.current?.off('user:joined', callback);
    };
  };

  const onUserLeft = (callback: (data: { userId: string; pageId: string }) => void) => {
    socketRef.current?.on('user:left', callback);
    return () => {
      socketRef.current?.off('user:left', callback);
    };
  };

  const onCursorMove = (callback: (data: { userId: string; position: any }) => void) => {
    socketRef.current?.on('cursor:move', callback);
    return () => {
      socketRef.current?.off('cursor:move', callback);
    };
  };

  const onNotification = (callback: (data: { type: string; message: string; userId: string }) => void) => {
    socketRef.current?.on('notification', callback);
    return () => {
      socketRef.current?.off('notification', callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinPage,
    leavePage,
    emitPageEdit,
    emitCursorUpdate,
    onPageUpdate,
    onUserJoined,
    onUserLeft,
    onCursorMove,
    onNotification,
  };
}
