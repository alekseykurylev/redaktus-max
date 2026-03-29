// ─────────────────────────────────────────────────────────────
// MAX Bridge — Public API
// ─────────────────────────────────────────────────────────────

// Types
export type {
  MaxWebApp,
  MaxPlatform,
  MaxUser,
  MaxChat,
  WebAppData,
  WebAppStartParam,
  BackButton,
  ScreenCapture,
  HapticFeedback,
  DeviceStorage,
  SecureStorage,
  BiometricManager,
  BiometricType,
  ImpactStyle,
  NotificationType,
  ChatType,
  ShareTextParams,
  ShareMediaParams,
  ShareMaxContentParams,
  MaxBridgeEventName,
} from "./types"

// Core bridge functions
export {
  getWebApp,
  isBridgeAvailable,
  ready,
  close,
  onEvent,
  offEvent,
  getInitData,
  getInitDataUnsafe,
  getUser,
  getPlatform,
  getVersion,
  showBackButton,
  hideBackButton,
  enableClosingConfirmation,
  disableClosingConfirmation,
  requestContact,
  openLink,
  openMaxLink,
  shareContent,
  shareMaxContent,
  downloadFile,
  requestMaxBrightness,
  restoreBrightness,
  enableScreenCaptureProtection,
  disableScreenCaptureProtection,
  isScreenCaptureProtected,
  hapticImpact,
  hapticNotification,
  hapticSelectionChanged,
  openCodeReader,
  getDeviceStorage,
  getSecureStorage,
  getBiometricManager,
} from "./bridge"

// React hooks
export {
  useMaxBridge,
  useMaxReady,
  useMaxEvent,
  useBackButton,
  useClosingConfirmation,
  useHaptic,
  usePhoneRequest,
  useQrReader,
} from "./hooks"

// Next.js component
export { MaxBridgeScript } from "./max-bridge-script"
