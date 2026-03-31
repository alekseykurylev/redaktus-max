export type MaxPlatform = "ios" | "android" | "desktop" | "web"

export type MaxTransportKind = "iframe" | "webview" | "fallback"

export type ChatType = "DIALOG" | "CHAT"

export type ImpactStyle = "soft" | "light" | "medium" | "heavy" | "rigid"

export type NotificationType = "error" | "success" | "warning"

export type BiometricType = "fingerprint" | "faceid" | "unknown"

export interface MaxUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export interface MaxChat {
  id: number
  type: string
}

export interface MaxInitData {
  hash?: string
  ip?: string
  query_id?: string
  start_param?: string
  auth_date?: number
  user?: MaxUser
  chat?: MaxChat
}

export interface MaxBridgeErrorShape {
  error: {
    code: string
    message?: string
    details?: unknown
  }
}

export interface MaxBridgeInfo {
  available: boolean
  transport: MaxTransportKind
  initData: string | null
  initDataUnsafe: MaxInitData
  platform: MaxPlatform | null
  version: string | null
  queryId: string | null
  user: MaxUser | null
  chat: MaxChat | null
}

export interface StorageSetRequest {
  key: string
  value: string | null
}

export interface StorageGetRequest {
  key: string
}

export interface StorageValueResponse {
  key?: string
  value: string | null
}

export interface ContactResponse {
  status?: string
  phone?: string
}

export interface ShareTextParams {
  text?: string
  link?: string
}

export interface ShareMediaParams {
  mid: string
  chatType: ChatType
}

export type ShareMaxContentParams = ShareTextParams | ShareMediaParams

export interface DownloadFileResponse {
  status?: string
}

export interface SwipesBehaviorResponse {
  allowVerticalSwipes: boolean
}

export interface ScreenCaptureResponse {
  isScreenCaptureEnabled: boolean
}

export interface ScreenBrightnessResponse {
  maxBrightness?: boolean
}

export interface CodeReaderResponse {
  value?: string
}

export interface BiometryInfo {
  available: boolean
  accessRequested: boolean
  accessGranted: boolean
  type: BiometricType[]
  tokenSaved: boolean
  deviceId: string | null
}

export interface BiometryAccessRequest {
  reason?: string
}

export interface BiometryTokenRequest {
  token: string
  reason?: string
}

export interface BiometryAuthResponse {
  status?: string
  token?: string
}

export interface BiometryTokenResponse {
  status?: string
}

export interface DeviceStorage {
  setItem(key: string, value: string | null): Promise<StorageValueResponse | unknown>
  getItem(key: string): Promise<StorageValueResponse | unknown>
  removeItem(key: string): Promise<StorageValueResponse | unknown>
  clear(): Promise<unknown>
}

export interface SecureStorage {
  setItem(key: string, value: string | null): Promise<StorageValueResponse | unknown>
  getItem(key: string): Promise<StorageValueResponse | unknown>
  removeItem(key: string): Promise<StorageValueResponse | unknown>
  clear(): Promise<unknown>
}

export interface BackButton {
  readonly isVisible: boolean
  show(): void
  hide(): void
  onClick(callback: () => void): () => void
  offClick(callback: () => void): void
}

export interface HapticFeedback {
  impactOccurred(
    impactStyle: ImpactStyle,
    disableVibrationFallback?: boolean,
  ): Promise<unknown>
  notificationOccurred(
    notificationType: NotificationType,
    disableVibrationFallback?: boolean,
  ): Promise<unknown>
  selectionChanged(disableVibrationFallback?: boolean): Promise<unknown>
}

export interface ScreenCapture {
  readonly isScreenCaptureEnabled: boolean
  enableScreenCapture(): Promise<ScreenCaptureResponse>
  disableScreenCapture(): Promise<ScreenCaptureResponse>
}

export interface BiometricManager {
  readonly isInited: boolean
  readonly isBiometricAvailable: boolean
  readonly isAccessRequested: boolean
  readonly isAccessGranted: boolean
  readonly isBiometricTokenSaved: boolean
  readonly biometricType: BiometricType[]
  readonly deviceId: string | null
  getBiometryInfo(): BiometryInfo
  init(): Promise<BiometryInfo>
  requestAccess(reason?: string): Promise<BiometryInfo>
  authenticate(reason?: string): Promise<BiometryAuthResponse | unknown>
  updateBiometricToken(token: string, reason?: string): Promise<BiometryTokenResponse | unknown>
  openSettings(): Promise<unknown>
}

export interface MaxBridgeEventMap {
  WebAppBackButtonPressed: undefined
}

export type MaxBridgeEventName = keyof MaxBridgeEventMap | string

export interface MaxBridge {
  readonly initData: string | null
  readonly initDataUnsafe: MaxInitData
  readonly platform: MaxPlatform | null
  readonly version: string | null
  readonly transportKind?: MaxTransportKind
  readonly isAvailable?: boolean
  readonly isVerticalSwipesEnabled?: boolean
  readonly DeviceStorage?: DeviceStorage
  readonly SecureStorage?: SecureStorage
  readonly BackButton: BackButton
  readonly BiometricManager: BiometricManager
  readonly HapticFeedback: HapticFeedback
  readonly ScreenCapture: ScreenCapture
  ready(): void
  close(): void
  sendEvent(eventType: string, eventData?: string): void
  postEvent(eventType: string, eventData?: Record<string, unknown>, onSent?: () => void): void
  onEvent<TEvent extends MaxBridgeEventName>(
    eventName: TEvent,
    callback: (payload: TEvent extends keyof MaxBridgeEventMap ? MaxBridgeEventMap[TEvent] : unknown) => void,
  ): () => void
  offEvent<TEvent extends MaxBridgeEventName>(
    eventName: TEvent,
    callback: (payload: TEvent extends keyof MaxBridgeEventMap ? MaxBridgeEventMap[TEvent] : unknown) => void,
  ): void
  requestContact(): Promise<ContactResponse | unknown>
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  openLink(url: string): void
  openMaxLink(url: string): void
  downloadFile(url: string, fileName: string): Promise<DownloadFileResponse | unknown>
  shareContent(params: ShareTextParams): Promise<unknown>
  shareMaxContent(params: ShareMaxContentParams): Promise<unknown>
  requestScreenMaxBrightness(): Promise<ScreenBrightnessResponse | unknown>
  restoreScreenBrightness(): Promise<ScreenBrightnessResponse | unknown>
  enableVerticalSwipes(): Promise<SwipesBehaviorResponse>
  disableVerticalSwipes(): Promise<SwipesBehaviorResponse>
  openCodeReader(fileSelect?: boolean): Promise<CodeReaderResponse | unknown>
}

export interface MaxBridgeScriptProps {
  readonly src?: string
  readonly autoReady?: boolean
}

declare global {
  interface Window {
    WebViewHandler?: {
      postEvent(eventType: string, payload: string): void
    }
  }
}
