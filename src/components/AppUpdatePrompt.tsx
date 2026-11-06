import { useEffect, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface AppUpdaterPlugin {
  checkForUpdate(): Promise<UpdateManifest & { available: boolean }>;
  installUpdate(options: { url: string; sha256: string }): Promise<{ requiresPermission: boolean }>;
}

interface UpdateManifest {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  sha256: string;
}

const AppUpdater = registerPlugin<AppUpdaterPlugin>('AppUpdater');

export default function AppUpdatePrompt() {
  const [update, setUpdate] = useState<UpdateManifest | null>(null);
  const [installing, setInstalling] = useState(false);
  const [permissionRequired, setPermissionRequired] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    let active = true;
    const checkForUpdate = async () => {
      try {
        const result = await AppUpdater.checkForUpdate();
        if (active && result.available) setUpdate(result);
      } catch (checkError) {
        console.error('Unable to check for Android app updates:', checkError);
      }
    };

    void checkForUpdate();
    return () => { active = false; };
  }, []);

  const install = async () => {
    if (!update || installing) return;
    setInstalling(true);
    setError('');
    try {
      const result = await AppUpdater.installUpdate({ url: update.apkUrl, sha256: update.sha256 });
      setPermissionRequired(result.requiresPermission);
    } catch (installError) {
      setError(installError instanceof Error ? installError.message : 'Unable to start the update.');
    } finally {
      setInstalling(false);
    }
  };

  if (!update) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-lg rounded-2xl border border-indigo-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900">Syncra update available</p>
          <p className="mt-1 text-sm text-slate-600">Version {update.versionName} is ready to install.</p>
          {permissionRequired && (
            <p className="mt-2 text-sm text-amber-700">
              Allow installs from Syncra in Android Settings, then return and tap Install update.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="button"
          onClick={install}
          disabled={installing}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {installing ? 'Preparing…' : permissionRequired ? 'Install update' : 'Update'}
        </button>
      </div>
    </aside>
  );
}
