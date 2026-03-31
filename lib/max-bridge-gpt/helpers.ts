import type {
  MaxBridgeErrorShape,
  MaxBridgeInfo,
  MaxBridge,
  MaxInitData,
  MaxPlatform,
  ShareMaxContentParams,
} from "./types"

const VALID_PLATFORMS: readonly MaxPlatform[] = ["ios", "android", "desktop", "web"]

export const INIT_DATA_KEY = "WebAppData"
export const PLATFORM_KEY = "WebAppPlatform"
export const VERSION_KEY = "WebAppVersion"

export const REQUEST_TIMEOUT_MS = 10_000
export const INTERACTIVE_REQUEST_TIMEOUT_MS = 60_000
export const CODE_READER_TIMEOUT_MS = 600_000

export function canUseDOM() {
  return typeof window !== "undefined"
}

export function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")
  }

  let fallback = Date.now().toString(36)
  while (fallback.length < 32) {
    fallback += Math.random().toString(36).slice(2)
  }
  return fallback.slice(0, 32)
}

export function createBridgeError(
  code: string,
  message?: string,
  details?: unknown,
): MaxBridgeErrorShape {
  return {
    error: {
      code,
      message,
      details,
    },
  }
}

export function isBridgeError(value: unknown): value is MaxBridgeErrorShape {
  return Boolean(
    value &&
      typeof value === "object" &&
      "error" in value &&
      value.error &&
      typeof value.error === "object" &&
      "code" in value.error,
  )
}

export function getErrorCode(value: unknown) {
  if (isBridgeError(value)) {
    return value.error.code
  }

  if (value instanceof Error) {
    return value.message
  }

  return "client.bridge.unknown"
}

export function getHashParam(hash: string, paramName: string) {
  try {
    const normalizedHash = hash.replace(/^#/, "")
    return new URLSearchParams(normalizedHash).get(paramName)
  } catch {
    return null
  }
}

export function extractParamFromHashes(paramName: string) {
  if (!canUseDOM()) {
    return null
  }

  try {
    const directValue = getHashParam(window.location.hash, paramName)
    if (directValue) {
      return directValue
    }

    const navigationEntry = performance.getEntriesByType("navigation")[0]
    const navigationHash = navigationEntry ? new URL(navigationEntry.name).hash : ""
    return navigationHash ? getHashParam(navigationHash, paramName) : null
  } catch {
    return null
  }
}

export function readHashParamOrSessionStorage(paramName: string) {
  if (!canUseDOM()) {
    return null
  }

  const hashValue = extractParamFromHashes(paramName)
  if (hashValue) {
    window.sessionStorage.setItem(paramName, hashValue)
    return hashValue
  }

  return window.sessionStorage.getItem(paramName)
}

export function parseInitData(rawInitData: string | null): MaxInitData {
  const result: MaxInitData = {}

  if (!rawInitData) {
    return result
  }

  try {
    const decoded = decodeURIComponent(rawInitData)
    const params = new URLSearchParams(decoded)

    params.forEach((value, key) => {
      switch (key) {
        case "hash":
        case "ip":
        case "query_id":
        case "start_param":
          result[key] = value
          break
        case "auth_date":
          result.auth_date = Number(value)
          break
        case "user":
          result.user = parseJsonObject(value)
          break
        case "chat":
          result.chat = parseJsonObject(value)
          break
        default:
          break
      }
    })
  } catch {
    return result
  }

  return result
}

function parseJsonObject<T>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export function normalizePlatform(value: string | null): MaxPlatform | null {
  return value && VALID_PLATFORMS.includes(value as MaxPlatform) ? (value as MaxPlatform) : null
}

export function readBridgeInfo(bridge: MaxBridge | null): MaxBridgeInfo {
  const initDataUnsafe = bridge?.initDataUnsafe ?? {}
  const transport =
    typeof window === "undefined"
      ? "fallback"
      : window.self !== window.top
        ? "iframe"
        : window.WebViewHandler
          ? "webview"
          : "fallback"

  return {
    available: Boolean(bridge),
    transport: bridge?.transportKind ?? transport,
    initData: bridge?.initData ?? null,
    initDataUnsafe,
    platform: bridge?.platform ?? null,
    version: bridge?.version ?? null,
    queryId: initDataUnsafe.query_id ?? null,
    user: initDataUnsafe.user ?? null,
    chat: initDataUnsafe.chat ?? null,
  }
}

export function compareVersions(left: string | null, right: string | null) {
  const leftParts = (left ?? "").split(".").map((part) => Number(part) || 0)
  const rightParts = (right ?? "").split(".").map((part) => Number(part) || 0)
  const maxLength = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0
    const rightValue = rightParts[index] ?? 0

    if (leftValue > rightValue) {
      return 1
    }

    if (leftValue < rightValue) {
      return -1
    }
  }

  return 0
}

export function isVersionAtLeast(currentVersion: string | null, expectedVersion: string) {
  return compareVersions(currentVersion, expectedVersion) >= 0
}

export function decodeMidToSharePayload(params: ShareMaxContentParams) {
  if (!("mid" in params)) {
    return params
  }

  const normalizedMid = params.mid.replace(/^mid\./, "")
  const chatIdHex = normalizedMid.slice(0, 16)
  const messageIdHex = normalizedMid.slice(16)

  if (!chatIdHex || !messageIdHex) {
    throw createBridgeError(
      "client.web_app_max_share.invalid_request",
      "Invalid MAX share payload.",
      params,
    )
  }

  let chatId = BigInt(`0x${chatIdHex}`)
  const messageId = BigInt(`0x${messageIdHex}`)

  if (params.chatType === "CHAT") {
    chatId -= BigInt(2 ** 64)
  }

  return {
    chatId: chatId.toString(),
    messageId: messageId.toString(),
  }
}
