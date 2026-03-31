"use client"

import { useEffect } from "react"
import { getWebApp, markMaxBridgeLoaded } from "./bridge"

type MaxBridgeProviderProps = {
  autoReady?: boolean
  children?: React.ReactNode
}

export function MaxBridgeProvider({
  autoReady = false,
  children,
}: MaxBridgeProviderProps) {
  useEffect(() => {
    let disposed = false
    let intervalId: ReturnType<typeof setInterval> | null = null
    let readySent = false

    const syncBridge = () => {
      if (disposed) {
        return
      }

      const bridge = getWebApp()

      if (!bridge) {
        return
      }

      markMaxBridgeLoaded()

      if (autoReady && !readySent) {
        readySent = true
        bridge.ready()
      }

      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    syncBridge()

    if (!getWebApp()) {
      intervalId = setInterval(syncBridge, 100)
    }

    return () => {
      disposed = true

      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoReady])

  return children ?? null
}
