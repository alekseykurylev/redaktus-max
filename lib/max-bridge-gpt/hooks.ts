"use client"

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react"
import {
  disableClosingConfirmation,
  enableClosingConfirmation,
  getServerMaxBridgeSnapshot,
  getWebApp,
  hapticImpact,
  hapticNotification,
  hapticSelectionChanged,
  onEvent,
  openCodeReader,
  requestContact,
  subscribeToMaxBridge,
} from "./bridge"
import { getErrorCode, readBridgeInfo } from "./helpers"
import type { ImpactStyle, MaxBridgeEventName, MaxBridgeInfo, NotificationType } from "./types"

const EMPTY_BRIDGE_INFO: MaxBridgeInfo = getServerMaxBridgeSnapshot()

function useBridgeInstance() {
  return useSyncExternalStore(subscribeToMaxBridge, getWebApp, () => null)
}

export function useMaxBridge() {
  const bridge = useBridgeInstance()
  return bridge ? readBridgeInfo(bridge) : EMPTY_BRIDGE_INFO
}

export function useMaxBridgeBootstrap(autoReady = false) {
  const bridge = useBridgeInstance()

  useEffect(() => {
    if (bridge && autoReady) {
      bridge.ready()
    }
  }, [autoReady, bridge])
}

export function useMaxReady() {
  useMaxBridgeBootstrap(true)
}

export function useMaxEvent(eventName: MaxBridgeEventName, handler: (payload: unknown) => void) {
  const bridge = useBridgeInstance()
  const onMessage = useEffectEvent(handler)

  useEffect(() => {
    if (!bridge) {
      return
    }

    return onEvent(eventName, (payload) => {
      onMessage(payload)
    })
  }, [bridge, eventName])
}

export function useBackButton(onBack: () => void, isVisible = true) {
  const bridge = useBridgeInstance()
  const handleBack = useEffectEvent(onBack)

  useEffect(() => {
    if (!bridge || !isVisible) {
      return
    }

    bridge.BackButton.show()

    const unsubscribe = bridge.BackButton.onClick(() => {
      handleBack()
    })

    return () => {
      unsubscribe()
      bridge.BackButton.hide()
    }
  }, [bridge, isVisible])
}

export function useClosingConfirmation(enabled = true) {
  const bridge = useBridgeInstance()

  useEffect(() => {
    if (!enabled) {
      if (bridge) {
        disableClosingConfirmation()
      }
      return
    }

    if (!bridge) {
      return
    }

    enableClosingConfirmation()

    return () => {
      disableClosingConfirmation()
    }
  }, [bridge, enabled])
}

export function useHaptic() {
  return {
    impact: (style: ImpactStyle, disableVibrationFallback?: boolean) =>
      hapticImpact(style, disableVibrationFallback),
    notification: (type: NotificationType, disableVibrationFallback?: boolean) =>
      hapticNotification(type, disableVibrationFallback),
    selectionChanged: (disableVibrationFallback?: boolean) =>
      hapticSelectionChanged(disableVibrationFallback),
  }
}

export function usePhoneRequest() {
  const [phone, setPhone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function requestPhone() {
    setIsPending(true)
    setError(null)

    try {
      const response = (await requestContact()) as { phone?: string }
      setPhone(response.phone ?? null)
    } catch (requestError) {
      setPhone(null)
      setError(getErrorCode(requestError))
    } finally {
      setIsPending(false)
    }
  }

  return {
    requestPhone,
    phone,
    error,
    isPending,
  }
}

export function useQrReader() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function scan(fileSelect = true) {
    setIsPending(true)
    setResult(null)
    setError(null)

    try {
      const response = (await openCodeReader(fileSelect)) as { value?: string }
      setResult(response.value ?? null)
    } catch (scanError) {
      setError(getErrorCode(scanError))
    } finally {
      setIsPending(false)
    }
  }

  return {
    scan,
    result,
    error,
    isPending,
  }
}
