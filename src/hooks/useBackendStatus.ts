import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

export type BackendStatus = 'checking' | 'online' | 'offline';

export interface BackendCapabilities {
  tesseract: boolean;
  poppler: boolean;
  ffmpeg: boolean;
}

interface UseBackendStatusResult {
  status: BackendStatus;
  capabilities: BackendCapabilities | null;
  retry: () => void;
}

/**
 * Polls the backend /health endpoint once on mount (and on retry).
 * Returns 'online' | 'offline' | 'checking'.
 */
export function useBackendStatus(): UseBackendStatusResult {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [capabilities, setCapabilities] = useState<BackendCapabilities | null>(null);
  const [tick, setTick] = useState(0);

  const retry = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.status === 'ok') {
          setStatus('online');
          setCapabilities({
            tesseract: data.tesseract ?? false,
            poppler: data.poppler ?? false,
            ffmpeg: data.ffmpeg ?? false,
          });
        } else {
          setStatus('offline');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('offline');
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [tick]);

  return { status, capabilities, retry };
}
