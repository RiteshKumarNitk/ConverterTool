import React from 'react';
import { ServerCrash, RefreshCw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BackendStatus, BackendCapabilities } from '../../hooks/useBackendStatus';

interface BackendRequiredProps {
  status: BackendStatus;
  capabilities?: BackendCapabilities | null;
  /** Extra system deps this tool needs (e.g. ['tesseract', 'ffmpeg']) */
  requires?: Array<keyof BackendCapabilities>;
  onRetry: () => void;
  children: React.ReactNode;
}

const DEP_LABELS: Record<keyof BackendCapabilities, { label: string; url: string }> = {
  tesseract: {
    label: 'Tesseract OCR',
    url: 'https://github.com/UB-Mannheim/tesseract/wiki',
  },
  poppler: {
    label: 'Poppler',
    url: 'https://github.com/oschwartz10612/poppler-windows/releases/',
  },
  ffmpeg: {
    label: 'FFmpeg',
    url: 'https://ffmpeg.org/download.html',
  },
};

/**
 * Wraps a backend-dependent tool.
 * Shows a friendly offline banner while the backend is unreachable,
 * and warns about missing system dependencies when online.
 */
export const BackendRequired: React.FC<BackendRequiredProps> = ({
  status,
  capabilities,
  requires = [],
  onRetry,
  children,
}) => {
  // Still checking
  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-sm">Connecting to backend…</p>
      </div>
    );
  }

  // Backend offline
  if (status === 'offline') {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 rounded-full">
            <ServerCrash className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Backend Not Running</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          This tool requires the Python backend server. Start it with:
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 text-left overflow-x-auto">
{`cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000`}
        </pre>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Backend online — check for missing system deps
  const missingDeps = requires.filter(dep => capabilities && !capabilities[dep]);

  return (
    <>
      {missingDeps.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Missing system dependencies:</p>
            <ul className="space-y-1">
              {missingDeps.map(dep => (
                <li key={dep}>
                  <span className="font-medium">{DEP_LABELS[dep].label}</span> is not installed.{' '}
                  <a
                    href={DEP_LABELS[dep].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-900"
                  >
                    Install →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {children}
    </>
  );
};
