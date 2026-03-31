"use client"

import { useState } from "react"
import {
  disableScreenCaptureProtection,
  downloadFile,
  enableScreenCaptureProtection,
  openLink,
  requestMaxBrightness,
  shareContent,
  shareMaxContent,
  useBackButton,
  useHaptic,
  useMaxBridge,
  usePhoneRequest,
  useQrReader,
} from "@/lib/max-bridge-gpt"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [shareError, setShareError] = useState<string | null>(null)

  const { available, user, platform, version } = useMaxBridge()
  useBackButton(() => router.back())
  const { impact, notification } = useHaptic()
  const { requestPhone, phone, error: phoneError, isPending } = usePhoneRequest()
  const { scan, result: qrResult, error: qrError, isPending: isQrPending } = useQrReader()

  const handleShare = async () => {
    setShareError(null)

    try {
      await shareContent({
        text: "Hello from MAX mini-app!",
        link: "https://max.ru",
      })
    } catch (error) {
      if (error && typeof error === "object" && "error" in error) {
        const bridgeError = error as { error?: { code?: string } }
        setShareError(bridgeError.error?.code ?? "MAX Bridge share failed")
        return
      }

      setShareError(error instanceof Error ? error.message : "MAX Bridge share failed")
    }
  }

  const handleMaxShare = async () => {
    setShareError(null)

    try {
      await shareMaxContent({
        text: "Hello from MAX internal share!",
        link: "https://max.ru",
      })
    } catch (error) {
      if (error && typeof error === "object" && "error" in error) {
        const bridgeError = error as { error?: { code?: string } }
        setShareError(bridgeError.error?.code ?? "MAX Bridge share failed")
        return
      }

      setShareError(error instanceof Error ? error.message : "MAX Bridge share failed")
    }
  }

  if (!available) {
    return <p>Running outside MAX — bridge not available.</p>
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <img src={user?.photo_url} alt={user?.id.toString()} />

      <h1>MAX Bridge Demo</h1>

      <section>
        <h2>User info</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <p>
          Platform: {platform} | Version: {version}
        </p>
      </section>

      <section>
        <h2>Haptic feedback</h2>
        <button onClick={() => impact("medium")}>Impact (medium)</button>
        <button onClick={() => notification("success")}>Notification (success)</button>
        <button onClick={() => notification("error")}>Notification (error)</button>
      </section>

      <section>
        <h2>Phone request</h2>
        <button onClick={requestPhone} disabled={isPending}>
          {isPending ? "Waiting…" : "Request phone"}
        </button>
        {phone && <p>Phone: {phone}</p>}
        {phoneError && <p style={{ color: "red" }}>Phone error: {phoneError}</p>}
      </section>

      <section>
        <h2>QR reader</h2>
        <button onClick={() => void scan()} disabled={isQrPending}>
          {isQrPending ? "Scanning..." : "Scan QR"}
        </button>
        {qrResult && <p>Result: {qrResult}</p>}
        {qrError && <p style={{ color: "red" }}>Error: {qrError}</p>}
      </section>

      <section>
        <h2>Links</h2>
        <button onClick={() => openLink("https://ya.ru/")}>Open external link</button>
      </section>

      <section>
        <h2>Share</h2>
        <button onClick={() => void handleShare()}>Share</button>
        <button onClick={() => void handleMaxShare()}>Share In MAX</button>
        {shareError && <p style={{ color: "red" }}>Share error: {shareError}</p>}
      </section>

      <section>
        <h2>Download</h2>
        <button onClick={() => void downloadFile("https://example.com/file.pdf", "document.pdf")}>
          Download file
        </button>
      </section>

      <section>
        <h2>Screen capture</h2>
        <button onClick={() => void enableScreenCaptureProtection()}>Protect screen</button>
        <button onClick={() => void disableScreenCaptureProtection()}>Allow capture</button>
      </section>

      <section>
        <h2>Brightness</h2>
        <button onClick={() => void requestMaxBrightness()}>Max brightness (30 s)</button>
      </section>
    </main>
  )
}
