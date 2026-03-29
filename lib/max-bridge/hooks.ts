// ─────────────────────────────────────────────────────────────
// MAX Bridge — React Hooks for Next.js
// Based on: https://dev.max.ru/docs/webapps/bridge
// ─────────────────────────────────────────────────────────────

"use client"

import { useCallback, useEffect, useState } from "react"
import {
  disableClosingConfirmation,
  enableClosingConfirmation,
  getInitDataUnsafe,
  getPlatform,
  getUser,
  getVersion,
  getWebApp,
  hapticImpact,
  hapticNotification,
  hapticSelectionChanged,
  isBridgeAvailable,
  onEvent,
  showBackButton as _showBackButton,
} from "./bridge"
import type { ImpactStyle, MaxBridgeEventName, NotificationType } from "./types"

// ── useMaxBridge ──────────────────────────────────────────────

/**
 * Returns basic bridge metadata: availability, platform, version, user.
 * Safe to call on the server (values will be `null` during SSR).
 */
export function useMaxBridge() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    setAvailable(isBridgeAvailable())
  }, [])

  return {
    available,
    platform: available ? getPlatform() : null,
    version: available ? getVersion() : null,
    user: available ? getUser() : null,
    initDataUnsafe: available ? getInitDataUnsafe() : null,
  }
}

// ── useMaxReady ───────────────────────────────────────────────

/**
 * Calls `WebApp.ready()` once after mount so MAX knows the mini-app has loaded.
 * Place this in the root layout or `_app`.
 */
export function useMaxReady() {
  useEffect(() => {
    getWebApp()?.ready()
  }, [])
}

// ── useMaxEvent ───────────────────────────────────────────────

/**
 * Subscribe to a MAX Bridge event for the lifetime of the component.
 *
 * @example
 * useMaxEvent("WebAppBackButtonPressed", () => router.back());
 */
export function useMaxEvent(eventName: MaxBridgeEventName, callback: (data?: unknown) => void) {
  // Stable reference so the effect only re-runs when eventName changes.
  const stableCallback = useCallback(callback, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return onEvent(eventName, stableCallback)
  }, [eventName, stableCallback])
}

// ── useBackButton ─────────────────────────────────────────────

/**
 * Show the MAX Back button while the component is mounted and call
 * `onBack` when the user taps it.
 *
 * @example
 * useBackButton(() => router.back());
 */
export function useBackButton(onBack: () => void) {
  useEffect(() => {
    return _showBackButton(onBack)
  }, [onBack])
}

// ── useClosingConfirmation ────────────────────────────────────

/**
 * Enable the "unsaved changes" closing confirmation dialog while mounted.
 *
 * @param enabled  Pass `false` to disable (default: `true`)
 */
export function useClosingConfirmation(enabled = true) {
  useEffect(() => {
    if (enabled) {
      enableClosingConfirmation()
      return () => disableClosingConfirmation()
    }
  }, [enabled])
}

// ── useHaptic ─────────────────────────────────────────────────

/**
 * Returns convenient haptic feedback helpers.
 *
 * @example
 * const { impact, notification } = useHaptic();
 * <button onClick={() => impact("medium")}>Click</button>
 */
export function useHaptic() {
  const impact = useCallback(
    (style: ImpactStyle, disableVibrationFallback?: boolean) =>
      hapticImpact(style, disableVibrationFallback),
    [],
  )

  const notification = useCallback(
    (type: NotificationType, disableVibrationFallback?: boolean) =>
      hapticNotification(type, disableVibrationFallback),
    [],
  )

  const selectionChanged = useCallback(
    (disableVibrationFallback?: boolean) => hapticSelectionChanged(disableVibrationFallback),
    [],
  )

  return { impact, notification, selectionChanged }
}

// ── usePhoneRequest ───────────────────────────────────────────

/**
 * Requests the user's phone number and returns it when granted.
 *
 * @returns `{ requestPhone, phone, isPending }`
 *
 * @example
 * const { requestPhone, phone } = usePhoneRequest();
 * <button onClick={requestPhone}>Share phone</button>
 * {phone && <p>Got: {phone}</p>}
 */
export function usePhoneRequest() {
  const [phone, setPhone] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    return onEvent("WebAppRequestPhone", (data) => {
      const d = data as { phone?: string } | undefined
      if (d?.phone) setPhone(d.phone)
      setIsPending(false)
    })
  }, [])

  const requestPhone = useCallback(() => {
    setIsPending(true)
    getWebApp()?.requestContact()
  }, [])

  return { requestPhone, phone, isPending }
}

// ── useQrReader ───────────────────────────────────────────────

/**
 * Opens the QR-code reader and returns the scanned value.
 *
 * @example
 * const { scan, result, error } = useQrReader();
 * <button onClick={() => scan()}>Scan QR</button>
 * {result && <p>Scanned: {result}</p>}
 */
export function useQrReader() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onEvent("WebAppOpenCodeReader", (data) => {
      const d = data as { value?: string; error?: { code: string } } | undefined
      if (d?.value) {
        setResult(d.value)
        setError(null)
      } else if (d?.error) {
        setError(d.error.code)
      }
    })
  }, [])

  const scan = useCallback((fileSelect = true) => {
    setResult(null)
    setError(null)
    getWebApp()?.openCodeReader(fileSelect)
  }, [])

  return { scan, result, error }
}
