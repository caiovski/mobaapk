import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/presentation/contexts/AuthContext';
import { CartProvider } from './src/presentation/contexts/CartContext';
import { ThemeProvider } from './src/presentation/contexts/ThemeContext';
import { FilterProvider } from './src/presentation/contexts/FilterContext';
import { ConnectivityProvider } from './src/presentation/contexts/ConnectivityContext';
import { ErrorBoundary } from './src/presentation/components/ErrorBoundary';
import { auditService } from './src/services/auditService';
import { NotificationService } from './src/services/notificationService';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import * as Sentry from '@sentry/react-native';
import { PostHogProvider } from 'posthog-react-native';

Sentry.init({
  dsn: 'https://057a16ede169637157ee16b9f6aa03b8@o4511538369069056.ingest.us.sentry.io/4511538373394432',
  debug: false,
});

function App() {
  useEffect(() => {
    auditService.log('app.started', { app: 'cliente' });
    auditService.healthCheck().then((status) => {
      if (status.status !== 'ok') {
        console.warn('[health] App iniciou com problemas de conexão:', status);
      }
    });
  }, []);

  useEffect(() => {
    const receivedListener = NotificationService.addNotificationReceivedListener(notification => {
      const { title, body } = notification.request.content;
      if (title) {
        Alert.alert(title, body ?? undefined);
      }
    });

    return () => {
      receivedListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider apiKey="phc_mWHHW3AmwcUip7i4fcXJ9ZBqqDp9honAwxv7PZHyDoKb" options={{ host: 'https://us.i.posthog.com' }}>
        <SafeAreaProvider>
          <ErrorBoundary>
          <ConnectivityProvider>
            <ThemeProvider>
              <AuthProvider>
                <FilterProvider>
                  <CartProvider>
                    <AppNavigator />
                  </CartProvider>
                </FilterProvider>
              </AuthProvider>
            </ThemeProvider>
          </ConnectivityProvider>
        </ErrorBoundary>
        </SafeAreaProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
