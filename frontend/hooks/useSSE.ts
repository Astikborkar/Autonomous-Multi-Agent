import { useEffect, useRef, useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function useSSE(endpoint: string, onMessage?: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const url = `${BASE_URL}${endpoint}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        setEvents((prev) => [parsed, ...prev.slice(0, 99)]);
        if (onMessage) onMessage(parsed);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    // Listen for custom event types emitted by Redis
    const eventTypes = [
      'workflow.started',
      'workflow.completed',
      'workflow.failed',
      'task.started',
      'task.completed',
      'task.failed',
      'task.retrying',
      'agent.log'
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e: any) => {
        try {
          const parsed = JSON.parse(e.data);
          setEvents((prev) => [parsed, ...prev.slice(0, 99)]);
          if (onMessage) onMessage(parsed);
        } catch (err) {
          console.error(`SSE parse error for ${type}:`, err);
        }
      });
    });

    es.onerror = () => {
      setIsConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [endpoint]);

  return { isConnected, events };
}
