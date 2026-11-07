package com.varista.app;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DocumentDownloader")
public class DocumentDownloaderPlugin extends Plugin {
    private static final String BFF_HOST = "bff.coresmith.duckdns.org";
    private static final String PDF_PATH_PATTERN = "^/api/(invoice|quotation)/[A-Za-z0-9_-]+/download$";
    private static final String FILE_NAME_PATTERN = "^[A-Za-z0-9._-]+\\.pdf$";

    @PluginMethod
    public void downloadPdf(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName");
        String authorization = call.getString("authorization");
        String tenantId = call.getString("tenantId");

        if (!isAllowedPdfUrl(url) || fileName == null || !fileName.matches(FILE_NAME_PATTERN)
                || authorization == null || authorization.trim().isEmpty()
                || tenantId == null || tenantId.trim().isEmpty()) {
            call.reject("Invalid PDF download details.");
            return;
        }

        try {
            DownloadManager downloadManager = (DownloadManager) getContext()
                    .getSystemService(Context.DOWNLOAD_SERVICE);
            if (downloadManager == null) {
                throw new IllegalStateException("Android download service is unavailable.");
            }

            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle(fileName);
            request.setDescription("Downloading document");
            request.setMimeType("application/pdf");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(false);
            request.addRequestHeader("Authorization", authorization);
            request.addRequestHeader("X-Tenant-ID", tenantId);

            long downloadId = downloadManager.enqueue(request);
            JSObject result = new JSObject();
            result.put("downloadId", downloadId);
            result.put("fileName", fileName);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to start the PDF download.", error);
        }
    }

    private boolean isAllowedPdfUrl(String value) {
        if (value == null) return false;
        Uri uri = Uri.parse(value);
        String path = uri.getPath();
        String authority = uri.getEncodedAuthority();
        return "https".equals(uri.getScheme())
                && BFF_HOST.equalsIgnoreCase(uri.getHost())
                && (BFF_HOST.equalsIgnoreCase(authority)
                    || (BFF_HOST + ":443").equalsIgnoreCase(authority))
                && uri.getQuery() == null
                && uri.getFragment() == null
                && path != null
                && path.matches(PDF_PATH_PATTERN);
    }
}
