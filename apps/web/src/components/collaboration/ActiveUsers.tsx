'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWebSocket } from '@/hooks/use-websocket';

interface CollaboratorCursor {
  userId: string;
  userName: string;
  position: { x: number; y: number };
  color: string;
}

interface ActiveUsersProps {
  pageId: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export function ActiveUsers({ pageId }: ActiveUsersProps) {
  const [activeUsers, setActiveUsers] = useState<Map<string, { name: string; color: string }>>(new Map());
  const [cursors, setCursors] = useState<Map<string, CollaboratorCursor>>(new Map());
  const { isConnected, joinPage, leavePage, onUserJoined, onUserLeft, onCursorMove } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    joinPage(pageId);

    const unsubscribeJoined = onUserJoined((data) => {
      if (data.pageId === pageId) {
        setActiveUsers((prev) => {
          const newMap = new Map(prev);
          const color = COLORS[newMap.size % COLORS.length];
          newMap.set(data.userId, { name: data.userName, color });
          return newMap;
        });
      }
    });

    const unsubscribeLeft = onUserLeft((data) => {
      if (data.pageId === pageId) {
        setActiveUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
        setCursors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    });

    const unsubscribeCursor = onCursorMove((data) => {
      setActiveUsers((prev) => {
        const user = prev.get(data.userId);
        if (user) {
          setCursors((prevCursors) => {
            const newMap = new Map(prevCursors);
            newMap.set(data.userId, {
              userId: data.userId,
              userName: user.name,
              position: data.position,
              color: user.color,
            });
            return newMap;
          });
        }
        return prev;
      });
    });

    return () => {
      leavePage(pageId);
      unsubscribeJoined();
      unsubscribeLeft();
      unsubscribeCursor();
    };
  }, [isConnected, pageId, joinPage, leavePage, onUserJoined, onUserLeft, onCursorMove]);

  return (
    <>
      {/* Active users avatars */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            <span className="text-sm text-muted-foreground mr-3">
              {activeUsers.size} {activeUsers.size === 1 ? 'usuario' : 'usuarios'} activos
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
            <span className="text-sm text-muted-foreground mr-3">Sin conexión</span>
          </div>
        )}
        
        <div className="flex -space-x-2">
          {Array.from(activeUsers.entries()).map(([userId, user]) => (
            <Avatar
              key={userId}
              className="h-8 w-8 border-2 border-background"
              style={{ borderColor: user.color }}
            >
              <AvatarFallback style={{ backgroundColor: user.color }}>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Collaborative cursors */}
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="pointer-events-none fixed z-50 transition-all duration-100"
          style={{
            left: cursor.position.x,
            top: cursor.position.y,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.65376 12.3673L13.1382 5.45C13.7923 4.84481 14.8268 5.30192 14.8268 6.18673V11.1927L19.4463 11.1927C20.3618 11.1927 20.8195 12.2641 20.1708 12.8733L12.6864 19.7906C12.0323 20.3958 10.9978 19.9387 10.9978 19.0539V14.0479H6.37829C5.46282 14.0479 5.00509 12.9765 5.65376 12.3673Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          <div
            className="ml-6 -mt-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </>
  );
}
