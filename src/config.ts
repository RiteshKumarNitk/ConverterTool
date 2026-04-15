/**
 * Centralized API configuration.
 * Uses environment variable VITE_API_URL or defaults to localhost:8000.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    UPLOAD: `${API_BASE_URL}/upload`,
    PROCESS: (fileId: string) => `${API_BASE_URL}/process/${fileId}`,
    DOWNLOAD: (fileId: string, format: string) => `${API_BASE_URL}/download/${fileId}/${format}`,
    SIGNATURE: `${API_BASE_URL}/signature`,
    IMAGE_ENHANCER: `${API_BASE_URL}/image-enhancer`,
    TEXT_TO_SPEECH: `${API_BASE_URL}/text-to-speech`,
    BULK_UPLOAD: `${API_BASE_URL}/bulk/upload`,
    BULK_SEND: `${API_BASE_URL}/bulk/send`,
    BULK_STATUS: (jobId: string) => `${API_BASE_URL}/bulk/status/${jobId}`,
    AUDIO_TO_TEXT: `${API_BASE_URL}/audio-to-text`,
    PDF_TO_IMAGE: `${API_BASE_URL}/pdf-to-image`,
    PDF_EDIT: `${API_BASE_URL}/pdf/edit`,
    OUTPUTS: (filename: string) => `${API_BASE_URL}/outputs/${filename}`,
};
