// ─────────────────────────────────────────────────────────────
// MAX Bridge — Type Definitions
// Based on: https://dev.max.ru/docs/webapps/bridge
// ─────────────────────────────────────────────────────────────

// ── Platform ──────────────────────────────────────────────────

export type MaxPlatform = "ios" | "android" | "desktop" | "web"

// ── User & Chat ───────────────────────────────────────────────

export interface MaxUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export type ChatType = "DIALOG" | "CHAT"

export interface MaxChat {
  id: number
  type: string
}

// ── WebAppStartParam ──────────────────────────────────────────

export interface WebAppStartParam {
  [key: string]: string
}

// ── WebAppData (initDataUnsafe) ───────────────────────────────

export interface WebAppData {
  query_id?: string
  auth_date?: number
  hash?: string
  start_param?: WebAppStartParam
  user?: MaxUser
  chat?: MaxChat
}

// ── HapticFeedback ────────────────────────────────────────────

export type ImpactStyle = "soft" | "light" | "medium" | "heavy" | "rigid"
export type NotificationType = "error" | "success" | "warning"

export interface HapticFeedback {
  impactOccurred(impactStyle: ImpactStyle, disableVibrationFallback?: boolean): void
  notificationOccurred(notificationType: NotificationType, disableVibrationFallback?: boolean): void
  selectionChanged(disableVibrationFallback?: boolean): void
}

// ── BackButton ────────────────────────────────────────────────

export interface BackButton {
  isVisible: boolean
  onClick(callback: () => void): void
  offClick(callback: () => void): void
  show(): void
  hide(): void
}

// ── ScreenCapture ─────────────────────────────────────────────

export interface ScreenCapture {
  /** true = capture is DISABLED (protected), false = capture is ALLOWED */
  isScreenCaptureEnabled: boolean
  enableScreenCapture(): void
  disableScreenCapture(): void
}

// ── DeviceStorage ─────────────────────────────────────────────

export interface DeviceStorage {
  setItem(key: string, value: string): void
  getItem(key: string): string | null
  removeItem(key: string): void
  clear(): void
}

// ── SecureStorage ─────────────────────────────────────────────

export interface SecureStorage {
  setItem(key: string, value: string): void
  getItem(key: string): string | null
  removeItem(key: string): void
}

// ── BiometricManager ──────────────────────────────────────────

export type BiometricType = "fingerprint" | "faceid" | "unknown"

export interface BiometricManager {
  isInited: boolean
  isBiometricAvailable: boolean
  biometricType: BiometricType[]
  deviceId: string | null
  isAccessRequested: boolean
  isAccessGranted: boolean
  isBiometricTokenSaved: boolean
  init(): void
  requestAccess(): void
  authenticate(): void
  updateBiometricToken(token: string): void
  openSettings(): void
}

// ── ShareContent params ───────────────────────────────────────

export interface ShareTextParams {
  text?: string
  link?: string
}

export interface ShareMediaParams {
  mid: string
  chatType: ChatType
}

export type ShareMaxContentParams = ShareTextParams | ShareMediaParams

// ── Bridge Events ─────────────────────────────────────────────

export type MaxBridgeEventName =
  | "WebAppReady"
  | "WebAppClose"
  | "WebAppSetupBackButton"
  | "WebAppRequestPhone"
  | "WebAppSetupClosingBehavior"
  | "WebAppBackButtonPressed"
  | "WebAppOpenLink"
  | "WebAppOpenMaxLink"
  | "WebAppShare"
  | "WebAppMaxShare"
  | "WebAppDownloadFile"
  | "WebAppSetupScreenCaptureBehavior"
  | "WebAppChangeScreenBrightness"
  | "WebAppHapticFeedbackImpact"
  | "WebAppHapticFeedbackNotification"
  | "WebAppHapticFeedbackSelectionChange"
  | "WebAppOpenCodeReader"

// ── Window.WebApp ─────────────────────────────────────────────

export interface MaxWebApp {
  /** URL-encoded init data string */
  initData: string
  /** Parsed init data — do NOT use for server-side validation */
  initDataUnsafe: WebAppData
  /** Platform: ios | android | desktop | web */
  platform: MaxPlatform
  /** MAX app version, e.g. "25.9.16" */
  version: string

  /** Subscribe to a Bridge event */
  onEvent(eventName: MaxBridgeEventName, callback: (data?: unknown) => void): void
  /** Unsubscribe from a Bridge event */
  offEvent(eventName: MaxBridgeEventName, callback: (data?: unknown) => void): void

  /** Signal that the mini-app is ready */
  ready(): void
  /** Close the mini-app */
  close(): void
  /** Ask the user for their phone number via native dialog */
  requestContact(): void

  /** Back button in the mini-app header */
  BackButton: BackButton
  /** Screen capture / recording control */
  ScreenCapture: ScreenCapture
  /** Haptic feedback */
  HapticFeedback: HapticFeedback
  /** Device-local storage (not supported on web) */
  DeviceStorage?: DeviceStorage
  /** Secure storage (not supported on web) */
  SecureStorage?: SecureStorage
  /** Biometric authentication manager */
  BiometricManager?: BiometricManager

  enableClosingConfirmation(): void
  disableClosingConfirmation(): void

  /** Open a URL in an external browser (requires user gesture) */
  openLink(url: string): void
  /** Open a max.ru deep link inside MAX (requires user gesture) */
  openMaxLink(url: string): void
  /** Trigger native share sheet (requires user gesture) */
  shareContent(text: string, link: string): void
  /** Trigger MAX-internal share screen (requires user gesture) */
  shareMaxContent(params: ShareMaxContentParams): void
  /** Download a file to the user's device (requires user gesture) */
  downloadFile(url: string, file_name: string): void

  requestScreenMaxBrightness(): void
  restoreScreenBrightness(): void

  /** Open camera / gallery QR-code reader */
  openCodeReader(fileSelect?: boolean): void
}

// ── Global augmentation ───────────────────────────────────────

declare global {
  interface Window {
    WebApp?: MaxWebApp
  }
}
