import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { AppButton } from '../../components/AppButton/AppButton';
import { useAppContext, useAppTheme } from '../../store/AppContext';
import { RootStackParamList } from '../../navigation/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { completeOnboarding } = useAppContext();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const pages = [
    {
      key: '1',
      title: t('onboarding.page1Title'),
      body: t('onboarding.page1Body'),
      icon: 'qrcode' as const,
    },
    {
      key: '2',
      title: t('onboarding.page2Title'),
      body: t('onboarding.page2Body'),
      icon: 'qrcode-scan' as const,
    },
    {
      key: '3',
      title: t('onboarding.page3Title'),
      body: t('onboarding.page3Body'),
      icon: 'share-variant-outline' as const,
    },
  ];

  const finish = async () => {
    await completeOnboarding();
    navigation.replace('Main', {
      screen: 'HomeTab',
      params: { screen: 'HomeMain' },
    });
  };

  const onNext = async () => {
    if (index >= pages.length - 1) {
      await finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(next);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={pages}
        keyExtractor={item => item.key}
        onScroll={onScroll}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <MaterialDesignIcons
                name={item.icon}
                size={68}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={[
                theme.typography.title,
                { color: theme.colors.textPrimary, marginTop: 24 },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 12,
                  paddingHorizontal: 24,
                },
              ]}
            >
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {pages.map((page, pageIndex) => (
          <View
            key={page.key}
            style={[
              styles.dot,
              {
                backgroundColor:
                  pageIndex === index
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <AppButton
          label={
            index === pages.length - 1
              ? t('common.getStarted')
              : t('common.next')
          }
          onPress={onNext}
          icon="arrow-right"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
  },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});
