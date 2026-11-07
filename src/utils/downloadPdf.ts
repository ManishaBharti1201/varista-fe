import { Capacitor, registerPlugin } from '@capacitor/core';
import { apiRequest } from './apiClient';
import { isTokenValid, logout } from './auth';

interface DocumentDownloaderPlugin {
  downloadPdf(options: {
    url: string;
    fileName: string;
    authorization: string;
    tenantId: string;
  }): Promise<{ downloadId: number; fileName: string }>;
}

const DocumentDownloader = registerPlugin<DocumentDownloaderPlugin>('DocumentDownloader');

const getTenantId = (): string | null => {
  try {
    const stored = JSON.parse(localStorage.getItem('tenant-storage') || '{}');
    const tenantId = stored?.state?.selectedTenantId;
    return typeof tenantId === 'string' || typeof tenantId === 'number'
      ? String(tenantId).trim() || null
      : null;
  } catch {
    return null;
  }
};

export async function downloadPdf(url: string, fileName: string): Promise<void> {
  if (Capacitor.getPlatform() === 'android') {
    if (!isTokenValid()) {
      logout();
      throw new Error('Session expired');
    }

    const token = localStorage.getItem('token');
    const tenantId = getTenantId();
    if (!token || !tenantId) throw new Error('Authentication and tenant are required to download this document');

    await DocumentDownloader.downloadPdf({
      url,
      fileName,
      authorization: `Bearer ${token}`,
      tenantId,
    });
    return;
  }

  const response = await apiRequest(url, { method: 'GET' });
  if (!response.ok) {
    const responseText = await response.text();
    let message = response.status === 404
      ? 'The PDF is unavailable. It may have been deleted or not generated.'
      : `Unable to download PDF (HTTP ${response.status}).`;
    try {
      const errorBody = JSON.parse(responseText) as { message?: unknown };
      if (typeof errorBody.message === 'string') message = errorBody.message;
    } catch {
      // Keep the status-based message for non-JSON responses.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.includes('application/pdf') || await blob.slice(0, 5).text() !== '%PDF-') {
    throw new Error('The server did not return a valid PDF.');
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}
