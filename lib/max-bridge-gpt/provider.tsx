"use client"

import { useEffect } from "react"
import { bootstrapMaxBridge } from "./bridge"

type MaxBridgeProviderProps = {
  autoReady?: boolean
  children?: React.ReactNode
}

export function MaxBridgeProvider({
  autoReady = false,
  children,
}: MaxBridgeProviderProps) {
  useEffect(() => {
    bootstrapMaxBridge({ autoReady })
  }, [autoReady])

  return children ?? null
}
