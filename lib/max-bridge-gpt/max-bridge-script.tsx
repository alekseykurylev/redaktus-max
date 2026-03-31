import Script from "next/script"
import { markMaxBridgeLoaded, ready } from "./bridge"
import type { MaxBridgeScriptProps } from "./types"

const DEFAULT_MAX_BRIDGE_SRC = "https://st.max.ru/js/max-web-app.js"

export function MaxBridgeScript({
  src = DEFAULT_MAX_BRIDGE_SRC,
  autoReady = false,
}: MaxBridgeScriptProps) {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      src={src}
      strategy="beforeInteractive"
      onReady={() => {
        markMaxBridgeLoaded()

        if (autoReady) {
          try {
            ready()
          } catch {
            return
          }
        }
      }}
    />
  )
}
