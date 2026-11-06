package com.varista.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.FileProvider;
import androidx.core.content.pm.PackageInfoCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

import org.json.JSONObject;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {
    private static final String APK_HOST = "varista.coresmith.duckdns.org";
    private static final String MANIFEST_URL = "https://" + APK_HOST + "/downloads/version.json";
    private static final String APK_PATH_PATTERN = "/downloads/Syncra-[0-9]+\\.apk";
    private static final long MAX_APK_SIZE = 250L * 1024L * 1024L;
    private static final int MAX_MANIFEST_SIZE = 32768;

    @PluginMethod
    public void checkForUpdate(PluginCall call) {
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                long installedVersionCode = PackageInfoCompat.getLongVersionCode(
                        getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0)
                );
                connection = (HttpURLConnection) new URL(MANIFEST_URL).openConnection();
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                connection.setInstanceFollowRedirects(false);
                connection.setRequestProperty("Cache-Control", "no-cache");
                if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                    throw new IllegalStateException("Update server returned HTTP " + connection.getResponseCode() + ".");
                }
                if (connection.getContentLengthLong() > MAX_MANIFEST_SIZE) {
                    throw new IllegalStateException("Update manifest exceeds the allowed size.");
                }

                ByteArrayOutputStream output = new ByteArrayOutputStream();
                byte[] buffer = new byte[2048];
                int count;
                try (InputStream input = new BufferedInputStream(connection.getInputStream())) {
                    while ((count = input.read(buffer)) != -1) {
                        if (output.size() + count > MAX_MANIFEST_SIZE) {
                            throw new IllegalStateException("Update manifest exceeds the allowed size.");
                        }
                        output.write(buffer, 0, count);
                    }
                }

                JSONObject manifest = new JSONObject(output.toString("UTF-8"));
                int versionCode = manifest.optInt("versionCode", 0);
                String versionName = manifest.optString("versionName", "");
                String apkUrl = manifest.optString("apkUrl", "");
                String sha256 = manifest.optString("sha256", "");
                if (versionCode < 1 || versionName.isEmpty() || !isAllowedApkUrl(apkUrl)
                        || !sha256.matches("(?i)[0-9a-f]{64}")) {
                    throw new IllegalStateException("The update manifest is invalid.");
                }

                JSObject result = new JSObject();
                result.put("available", versionCode > installedVersionCode);
                result.put("versionCode", versionCode);
                result.put("versionName", versionName);
                result.put("apkUrl", apkUrl);
                result.put("sha256", sha256);
                call.resolve(result);
            } catch (Exception error) {
                call.reject("Unable to check for Android app updates.", error);
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

    @PluginMethod
    public void installUpdate(PluginCall call) {
        String apkUrl = call.getString("url");
        String expectedSha256 = call.getString("sha256");
        if (!isAllowedApkUrl(apkUrl) || expectedSha256 == null || !expectedSha256.matches("(?i)[0-9a-f]{64}")) {
            call.reject("Invalid update download details.");
            return;
        }

        new Thread(() -> {
            File apkFile = new File(getContext().getCacheDir(), "syncra-update.apk");
            try {
                downloadAndVerify(apkUrl, expectedSha256, apkFile);
                getActivity().runOnUiThread(() -> launchInstaller(call, apkFile));
            } catch (Exception error) {
                if (apkFile.exists() && !apkFile.delete()) {
                    Log.w("AppUpdater", "Could not remove incomplete update APK.");
                }
                call.reject("Unable to download or verify the update APK.", error);
            }
        }).start();
    }

    private boolean isAllowedApkUrl(String apkUrl) {
        if (apkUrl == null) return false;
        try {
            URL url = new URL(apkUrl);
            return "https".equals(url.getProtocol())
                    && APK_HOST.equalsIgnoreCase(url.getHost())
                    && (url.getPort() == -1 || url.getPort() == 443)
                    && url.getUserInfo() == null
                    && url.getQuery() == null
                    && url.getRef() == null
                    && url.getPath().matches(APK_PATH_PATTERN);
        } catch (Exception ignored) {
            return false;
        }
    }

    private void downloadAndVerify(String apkUrl, String expectedSha256, File apkFile) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(apkUrl).openConnection();
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(30000);
        connection.setInstanceFollowRedirects(false);
        try {
            int status = connection.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) {
                throw new IllegalStateException("Update server returned HTTP " + status + ".");
            }
            long contentLength = connection.getContentLengthLong();
            if (contentLength > MAX_APK_SIZE) {
                throw new IllegalStateException("Update APK exceeds the allowed size.");
            }

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            long bytesRead = 0;
            byte[] buffer = new byte[8192];
            try (InputStream input = new BufferedInputStream(connection.getInputStream());
                 BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(apkFile))) {
                int count;
                while ((count = input.read(buffer)) != -1) {
                    bytesRead += count;
                    if (bytesRead > MAX_APK_SIZE) {
                        throw new IllegalStateException("Update APK exceeds the allowed size.");
                    }
                    digest.update(buffer, 0, count);
                    output.write(buffer, 0, count);
                }
            }

            String actualSha256 = toHex(digest.digest());
            if (!actualSha256.equalsIgnoreCase(expectedSha256)) {
                throw new SecurityException("Update APK checksum does not match.");
            }
        } finally {
            connection.disconnect();
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            result.append(String.format("%02x", value & 0xff));
        }
        return result.toString();
    }

    private void launchInstaller(PluginCall call, File apkFile) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    && !getContext().getPackageManager().canRequestPackageInstalls()) {
                Intent settingsIntent = new Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getContext().getPackageName())
                );
                getActivity().startActivity(settingsIntent);
                JSObject result = new JSObject();
                result.put("requiresPermission", true);
                call.resolve(result);
                return;
            }

            Uri apkUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    apkFile
            );
            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(installIntent);
            JSObject result = new JSObject();
            result.put("requiresPermission", false);
            call.resolve(result);
        } catch (ActivityNotFoundException error) {
            call.reject("No Android package installer is available.", error);
        } catch (Exception error) {
            call.reject("Unable to open the Android package installer.", error);
        }
    }
}
