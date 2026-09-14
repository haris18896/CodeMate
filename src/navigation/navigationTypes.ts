import { NavigatorScreenParams } from '@react-navigation/native';
import { CodeRecord } from '../types/code';

export type HomeStackParamList = {
  HomeMain: undefined;
  GenerateQR: undefined;
  GenerateBarcode: undefined;
  QRPreview: { codeId: string };
  BarcodePreview: { codeId: string };
  CodeDetails: { codeId: string };
};

export type HistoryStackParamList = {
  HistoryMain: undefined;
  CodeDetails: { codeId: string };
  QRPreview: { codeId: string };
  BarcodePreview: { codeId: string };
};

export type ScanStackParamList = {
  ScannerMain: undefined;
  ScanResult: { codeId: string };
  CodeDetails: { codeId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  FormTemplates: undefined;
  EditFormTemplate: { templateId: string };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  ScanTab: NavigatorScreenParams<ScanStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type PreviewRouteParams = {
  codeId: string;
  record?: CodeRecord;
};
