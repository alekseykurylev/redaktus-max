// ─────────────────────────────────────────────────────────────
// MAX Bridge — Core Module
// Based on: https://dev.max.ru/docs/webapps/bridge
// ─────────────────────────────────────────────────────────────

import type {
  MaxWebApp,
  MaxBridgeEventName,
  ImpactStyle,
  NotificationType,
  ShareMaxContentParams,
  ShareTextParams,
} from "./types"

// ── Helpers ───────────────────────────────────────────────────

/**
 * Returns the global `window.WebApp` object or `null` if the bridge
 * is not available (e.g. during SSR or outside the MAX client).
 */
export function getWebApp(): MaxWebApp | null {
  if (typeof window === "undefined") return null
  return window.WebApp ?? null
}

/**
 * Returns `true` when running inside the MAX client with the bridge loaded.
 */
export function isBridgeAvailable(): boolean {
  return getWebApp() !== null
}

// ── Lifecycle ─────────────────────────────────────────────────

/**
 * Signal to MAX that the mini-app has finished loading and is ready.
 * Call this as early as possible (e.g. in `useEffect` on the root page).
 */
export function ready(): void {
  getWebApp()?.ready()
}

/**
 * Programmatically close the mini-app.
 */
export function close(): void {
  getWebApp()?.close()
}

// ── Events ────────────────────────────────────────────────────

/**
 * Subscribe to a MAX Bridge event.
 * Returns an unsubscribe function for easy cleanup in `useEffect`.
 *
 * @example
 * useEffect(() => onEvent("WebAppBackButtonPressed", () => router.back()), []);
 */
export function onEvent(
  eventName: MaxBridgeEventName,
  callback: (data?: unknown) => void,
): () => void {
  const app = getWebApp()
  if (!app) return () => {}
  app.onEvent(eventName, callback)
  return () => app.offEvent(eventName, callback)
}

/**
 * Unsubscribe a callback from a MAX Bridge event.
 */
export function offEvent(eventName: MaxBridgeEventName, callback: (data?: unknown) => void): void {
  getWebApp()?.offEvent(eventName, callback)
}

// ── User & init data ──────────────────────────────────────────

/**
 * Returns the raw URL-encoded init data string for server-side validation.
 */
export function getInitData(): string {
  return getWebApp()?.initData ?? ""
}

/**
 * Returns the parsed init data object.
 * ⚠️  Do NOT use this for server-side authentication — use `getInitData()` instead.
 */
export function getInitDataUnsafe() {
  return getWebApp()?.initDataUnsafe ?? null
}

/**
 * Convenience: returns the current user object from init data (unsafe).
 */
export function getUser() {
  return getWebApp()?.initDataUnsafe?.user ?? null
}

/**
 * Returns the platform the mini-app is running on.
 */
export function getPlatform() {
  return getWebApp()?.platform ?? null
}

/**
 * Returns the MAX app version string (e.g. "25.9.16").
 */
export function getVersion() {
  return getWebApp()?.version ?? null
}

// ── Back button ───────────────────────────────────────────────

/**
 * Show the Back button in the mini-app header and register a click handler.
 * Returns a cleanup function that hides the button and removes the handler.
 *
 * @example
 * useEffect(() => showBackButton(() => router.back()), []);
 */
export function showBackButton(onClick: () => void): () => void {
  const app = getWebApp()
  if (!app) return () => {}
  app.BackButton.show()
  app.BackButton.onClick(onClick)
  return () => {
    app.BackButton.offClick(onClick)
    app.BackButton.hide()
  }
}

/**
 * Hide the Back button.
 */
export function hideBackButton(): void {
  getWebApp()?.BackButton.hide()
}

// ── Closing confirmation ──────────────────────────────────────

/**
 * Show a "your changes may be lost" confirmation dialog when the user
 * tries to close the mini-app.
 */
export function enableClosingConfirmation(): void {
  getWebApp()?.enableClosingConfirmation()
}

export function disableClosingConfirmation(): void {
  getWebApp()?.disableClosingConfirmation()
}

// ── Phone request ─────────────────────────────────────────────

/**
 * Ask the user to share their phone number via a native dialog.
 * Listen for the response with `onEvent("WebAppRequestPhone", cb)`.
 */
export function requestContact(): void {
  getWebApp()?.requestContact()
}

// ── Links & sharing ───────────────────────────────────────────

/**
 * Open a URL in the device's external browser.
 * Requires a user gesture (click) immediately before calling.
 */
export function openLink(url: string): void {
  getWebApp()?.openLink(url)
}

/**
 * Open a max.ru deep link inside MAX (falls back to external browser).
 * Requires a user gesture (click) immediately before calling.
 */
export function openMaxLink(url: string): void {
  getWebApp()?.openMaxLink(url)
}

/**
 * Trigger the native share sheet with text / link.
 * Requires a user gesture (click) immediately before calling.
 */
export function shareContent(text: string, link?: string): Promise<unknown>
export function shareContent(params: ShareTextParams): Promise<unknown>
export function shareContent(
  paramsOrText: ShareTextParams | string,
  link?: string,
): Promise<unknown> {
  const params =
    typeof paramsOrText === "string" ? { text: paramsOrText, link } : paramsOrText

  return getWebApp()?.shareContent(params) ?? Promise.reject(new Error("MAX Bridge unavailable"))
}

/**
 * Trigger the MAX-internal share screen (text/link or forwarded message).
 * Requires a user gesture (click) immediately before calling.
 */
export function shareMaxContent(params: ShareMaxContentParams): Promise<unknown> {
  return getWebApp()?.shareMaxContent(params) ?? Promise.reject(new Error("MAX Bridge unavailable"))
}

// ── File download ─────────────────────────────────────────────

/**
 * Download a file to the user's device.
 * Requires a user gesture (click) immediately before calling.
 */
export function downloadFile(url: string, fileName: string): Promise<unknown> {
  return getWebApp()?.downloadFile(url, fileName) ?? Promise.reject(new Error("MAX Bridge unavailable"))
}

// ── Screen brightness ─────────────────────────────────────────

/**
 * Set screen brightness to maximum for 30 seconds.
 */
export function requestMaxBrightness(): Promise<unknown> {
  return (
    getWebApp()?.requestScreenMaxBrightness() ?? Promise.reject(new Error("MAX Bridge unavailable"))
  )
}

/**
 * Restore screen brightness to its original value.
 */
export function restoreBrightness(): Promise<unknown> {
  return getWebApp()?.restoreScreenBrightness() ?? Promise.reject(new Error("MAX Bridge unavailable"))
}

// ── Screen capture ────────────────────────────────────────────

/**
 * Prevent the user from taking screenshots or recording the screen.
 */
export function enableScreenCaptureProtection(): void {
  getWebApp()?.ScreenCapture.enableScreenCapture()
}

/**
 * Allow screenshots and screen recordings again.
 */
export function disableScreenCaptureProtection(): void {
  getWebApp()?.ScreenCapture.disableScreenCapture()
}

/**
 * Returns whether screen capture protection is currently active.
 * `true` = capturing is disabled (protected).
 */
export function isScreenCaptureProtected(): boolean {
  return getWebApp()?.ScreenCapture.isScreenCaptureEnabled ?? false
}

// ── Haptic feedback ───────────────────────────────────────────

/**
 * Trigger an impact haptic effect.
 */
export function hapticImpact(
  style: ImpactStyle,
  disableVibrationFallback = false,
): Promise<unknown> {
  return (
    getWebApp()?.HapticFeedback.impactOccurred(style, disableVibrationFallback) ??
    Promise.reject(new Error("MAX Bridge unavailable"))
  )
}

/**
 * Trigger a notification haptic effect (success / error / warning).
 */
export function hapticNotification(
  type: NotificationType,
  disableVibrationFallback = false,
): Promise<unknown> {
  return (
    getWebApp()?.HapticFeedback.notificationOccurred(type, disableVibrationFallback) ??
    Promise.reject(new Error("MAX Bridge unavailable"))
  )
}

/**
 * Trigger a selection-change haptic effect.
 */
export function hapticSelectionChanged(disableVibrationFallback = false): Promise<unknown> {
  return (
    getWebApp()?.HapticFeedback.selectionChanged(disableVibrationFallback) ??
    Promise.reject(new Error("MAX Bridge unavailable"))
  )
}

// ── QR / Code Reader ──────────────────────────────────────────

/**
 * Open the QR-code reader camera.
 * Listen for the result with `onEvent("WebAppOpenCodeReader", cb)`.
 *
 * @param fileSelect  `true` (default) — also allow picking from the gallery
 */
export function openCodeReader(fileSelect = true): Promise<unknown> {
  return getWebApp()?.openCodeReader(fileSelect) ?? Promise.reject(new Error("MAX Bridge unavailable"))
}

// ── Storage helpers ───────────────────────────────────────────

/**
 * Access device-local storage (not available on web platform).
 * Returns `null` if unavailable.
 */
export function getDeviceStorage() {
  return getWebApp()?.DeviceStorage ?? null
}

/**
 * Access secure storage (not available on web platform).
 * Returns `null` if unavailable.
 */
export function getSecureStorage() {
  return getWebApp()?.SecureStorage ?? null
}

/**
 * Access the biometric manager.
 * Returns `null` if unavailable.
 */
export function getBiometricManager() {
  return getWebApp()?.BiometricManager ?? null
}
