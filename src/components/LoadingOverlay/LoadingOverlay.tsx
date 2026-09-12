import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../store/AppContext';

export function LoadingOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message?: string;
}) {
  const theme = useAppTheme();
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.box,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
            },
          ]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message ? (
            <Text
              style={[
                theme.typography.body,
                { color: theme.colors.textPrimary, marginTop: 12 },
              ]}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    minWidth: 140,
    padding: 24,
    alignItems: 'center',
  },
});
