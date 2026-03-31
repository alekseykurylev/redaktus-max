import { createBridgeError, isBridgeError, readBridgeInfo } from "./helpers"
import type {
  ImpactStyle,
  MaxBridge,
  MaxBridgeEventName,
  MaxBridgeInfo,
  NotificationType,
  ShareMaxContentParams,
  ShareTextParams,
} from "./types"

const bridgeSubscribers = new Set<() => void>()

function notifyBridgeSubscribers() {
  bridgeSubscribers.forEach((callback) => callback())
}

export function markMaxBridgeLoaded() {
  notifyBridgeSubscribers()
}

export function getWebApp() {
  if (typeof window === "undefined") {
    return null
  }

  const windowWithBridge = window as unknown as { WebApp?: MaxBridge }
  return windowWithBridge.WebApp ?? null
}

export function getMaxBridge() {
  return getWebApp()
}

export function ensureMaxBridge() {
  return getWebApp()
}

export function getMaxBridgeSnapshot(): MaxBridgeInfo {
  return readBridgeInfo(getWebApp())
}

export function subscribeToMaxBridge(callback: () => void) {
  bridgeSubscribers.add(callback)

  return () => {
    bridgeSubscribers.delete(callback)
  }
}

export function bootstrapMaxBridge(options: { autoReady?: boolean } = {}) {
  const bridge = getWebApp()

  if (bridge && options.autoReady) {
    bridge.ready()
  }

  notifyBridgeSubscribers()
  return bridge
}

export function isMaxBridgeAvailable() {
  return getMaxBridgeSnapshot().available
}

export function getInitData() {
  return getMaxBridgeSnapshot().initData
}

export function getInitDataUnsafe() {
  return getMaxBridgeSnapshot().initDataUnsafe
}

export function getPlatform() {
  return getMaxBridgeSnapshot().platform
}

export function getVersion() {
  return getMaxBridgeSnapshot().version
}

export function getQueryId() {
  return getMaxBridgeSnapshot().queryId
}

export function getUser() {
  return getMaxBridgeSnapshot().user
}

export function getChat() {
  return getMaxBridgeSnapshot().chat
}

export function ready() {
  return requireBridge().ready()
}

export function close() {
  return requireBridge().close()
}

export function onEvent(eventName: MaxBridgeEventName, callback: (payload: unknown) => void) {
  return requireBridge().onEvent(eventName, callback)
}

export function offEvent(eventName: MaxBridgeEventName, callback: (payload: unknown) => void) {
  requireBridge().offEvent(eventName, callback)
}

export function requestContact() {
  return requireBridge().requestContact()
}

export function enableClosingConfirmation() {
  requireBridge().enableClosingConfirmation()
}

export function disableClosingConfirmation() {
  requireBridge().disableClosingConfirmation()
}

export function openLink(url: string) {
  requireBridge().openLink(url)
}

export function openMaxLink(url: string) {
  requireBridge().openMaxLink(url)
}

export function shareContent(params: ShareTextParams | string, link?: string) {
  const normalizedParams = typeof params === "string" ? { text: params, link } : params
  return requireBridge().shareContent(normalizedParams)
}

export function shareMaxContent(params: ShareMaxContentParams) {
  return requireBridge().shareMaxContent(params)
}

export function downloadFile(url: string, fileName: string) {
  return requireBridge().downloadFile(url, fileName)
}

export function requestMaxBrightness() {
  return requireBridge().requestScreenMaxBrightness()
}

export function restoreBrightness() {
  return requireBridge().restoreScreenBrightness()
}

export function enableVerticalSwipes() {
  return requireBridge().enableVerticalSwipes()
}

export function disableVerticalSwipes() {
  return requireBridge().disableVerticalSwipes()
}

export function enableScreenCaptureProtection() {
  return requireBridge().ScreenCapture.enableScreenCapture()
}

export function disableScreenCaptureProtection() {
  return requireBridge().ScreenCapture.disableScreenCapture()
}

export function isScreenCaptureProtected() {
  return getWebApp()?.ScreenCapture.isScreenCaptureEnabled ?? false
}

export function hapticImpact(style: ImpactStyle, disableVibrationFallback = false) {
  return requireBridge().HapticFeedback.impactOccurred(style, disableVibrationFallback)
}

export function hapticNotification(type: NotificationType, disableVibrationFallback = false) {
  return requireBridge().HapticFeedback.notificationOccurred(type, disableVibrationFallback)
}

export function hapticSelectionChanged(disableVibrationFallback = false) {
  return requireBridge().HapticFeedback.selectionChanged(disableVibrationFallback)
}

export function openCodeReader(fileSelect = true) {
  return requireBridge().openCodeReader(fileSelect)
}

export function getDeviceStorage() {
  return getWebApp()?.DeviceStorage ?? null
}

export function getSecureStorage() {
  return getWebApp()?.SecureStorage ?? null
}

export function getBiometricManager() {
  return getWebApp()?.BiometricManager ?? null
}

export function supportsMaxFeature(
  feature:
    | "backButton"
    | "biometry"
    | "deviceStorage"
    | "secureStorage"
    | "haptics"
    | "screenCapture"
    | "verticalSwipes",
) {
  const bridge = getWebApp()

  if (!bridge) {
    return false
  }

  switch (feature) {
    case "biometry":
      return Boolean(bridge.BiometricManager)
    case "deviceStorage":
      return Boolean(bridge.DeviceStorage)
    case "secureStorage":
      return Boolean(bridge.SecureStorage)
    default:
      return true
  }
}

function requireBridge() {
  const bridge = getWebApp()

  if (!bridge) {
    throw createBridgeError(
      "client.bridge.unavailable",
      "MAX Bridge script is not loaded or WebApp is unavailable.",
    )
  }

  return bridge
}

export { createBridgeError, isBridgeError }
