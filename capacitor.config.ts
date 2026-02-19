import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.varista.app',
  appName: 'varista-fe',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
