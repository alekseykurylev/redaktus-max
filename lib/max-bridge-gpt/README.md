# MAX Bridge GPT

`lib/max-bridge-gpt` это типизированная production-обёртка над официальным скриптом MAX Bridge `https://st.max.ru/js/max-web-app.js`.

Источники истины:
- поведение runtime и форма API: [`max-web-app.js`](/Users/alekseykurylev/Downloads/max-web-app.js)
- официальная справка: [документация MAX Bridge](https://dev.max.ru/docs/webapps/bridge)

Если между документацией и реальным скриптом есть расхождения, приоритет у `max-web-app.js`.

## Как подключать

В App Router скрипт нужно подключить один раз в корневом layout:

```tsx
import { MaxBridgeScript } from "@/lib/max-bridge-gpt"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <MaxBridgeScript autoReady />
        {children}
      </body>
    </html>
  )
}
```

`MaxBridgeScript` загружает официальный `max-web-app.js`, после чего в браузере появляется глобальный `window.WebApp`.

`lib/max-bridge-gpt` не подменяет этот объект своим runtime, а работает как типизированная обёртка поверх него.

## Структура модуля

- [`bridge.ts`](/Users/alekseykurylev/dev/redaktus-max/lib/max-bridge-gpt/bridge.ts): typed wrappers над `window.WebApp`, доступ к bridge, actions, feature checks
- [`hooks.ts`](/Users/alekseykurylev/dev/redaktus-max/lib/max-bridge-gpt/hooks.ts): React hooks для client-компонентов
- [`helpers.ts`](/Users/alekseykurylev/dev/redaktus-max/lib/max-bridge-gpt/helpers.ts): парсинг `initData`, обработка ошибок, сравнение версий, низкоуровневые utility helpers
- [`types.ts`](/Users/alekseykurylev/dev/redaktus-max/lib/max-bridge-gpt/types.ts): типы bridge API
- [`max-bridge-script.tsx`](/Users/alekseykurylev/dev/redaktus-max/lib/max-bridge-gpt/max-bridge-script.tsx): загрузка официального скрипта через `next/script`

## Хуки

### `useMaxBridge()`

Возвращает актуальный snapshot bridge-состояния:

```ts
{
  available: boolean
  transport: "iframe" | "webview" | "fallback"
  initData: string | null
  initDataUnsafe: MaxInitData
  platform: "ios" | "android" | "desktop" | "web" | null
  version: string | null
  queryId: string | null
  user: MaxUser | null
  chat: MaxChat | null
}
```

Используйте этот хук, когда нужно:
- понять, доступен ли bridge
- получить пользователя, чат, платформу, версию
- читать `initData` и `initDataUnsafe`

### `useMaxBridgeBootstrap(autoReady?: boolean)`

Ждёт появления реального `window.WebApp`.

Если `autoReady=true`, вызывает `WebApp.ready()`.

Обычно не нужен, если в layout уже используется `<MaxBridgeScript autoReady />`.

### `useMaxReady()`

Короткая форма для `useMaxBridgeBootstrap(true)`.

Подходит, если вы хотите вызывать `ready()` не в layout, а из конкретной client-страницы или client-layout.

### `useMaxEvent(eventName, handler)`

Подписывает компонент на событие bridge и автоматически снимает подписку при unmount.

Пример:

```tsx
useMaxEvent("WebAppBackButtonPressed", () => {
  router.back()
})
```

### `useBackButton(onBack, isVisible = true)`

Показывает `BackButton`, вешает обработчик нажатия и при cleanup скрывает кнопку.

Подходит для экранов, где нужно синхронизировать системную кнопку MAX с роутингом приложения.

### `useClosingConfirmation(enabled = true)`

Включает или выключает предупреждение о потере данных при закрытии mini-app.

Полезно для:
- форм
- редакторов
- многошаговых сценариев

### `useHaptic()`

Возвращает helper-методы для haptic feedback:

```ts
{
  impact(style, disableVibrationFallback?)
  notification(type, disableVibrationFallback?)
  selectionChanged(disableVibrationFallback?)
}
```

Обычно вызывается внутри пользовательских действий: нажатий, подтверждений, ошибок, success-state.

### `usePhoneRequest()`

Состояние и helper для `requestContact()`:

```ts
{
  requestPhone: () => Promise<void>
  phone: string | null
  error: string | null
  isPending: boolean
}
```

`error` приводится к string code или тексту ошибки.

### `useQrReader()`

Состояние и helper для `openCodeReader()`:

```ts
{
  scan: (fileSelect?: boolean) => Promise<void>
  result: string | null
  error: string | null
  isPending: boolean
}
```

Подходит для QR-flow, invite links, login token scan.

## Хелперы из `bridge.ts`

### Доступ к bridge

- `getWebApp()`: возвращает сырой `window.WebApp` или `null`
- `getMaxBridge()`: alias для `getWebApp()`
- `ensureMaxBridge()`: возвращает текущий bridge или `null`, ничего не создаёт сам
- `getMaxBridgeSnapshot()`: нормализованный snapshot для UI
- `subscribeToMaxBridge(listener)`: подписка на появление bridge после загрузки скрипта
- `markMaxBridgeLoaded()`: внутренний helper, которым `MaxBridgeScript` сообщает, что bridge загружен

### Получение данных

- `getInitData()`: raw `initData`, подходит для серверной валидации
- `getInitDataUnsafe()`: распарсенные данные из bridge
- `getUser()`
- `getChat()`
- `getQueryId()`
- `getPlatform()`
- `getVersion()`

### Actions

- `ready()`
- `close()`
- `openLink(url)`
- `openMaxLink(url)`
- `shareContent({ text, link })`
- `shareMaxContent(...)`
- `downloadFile(url, fileName)`
- `requestContact()`
- `requestMaxBrightness()`
- `restoreBrightness()`
- `enableScreenCaptureProtection()`
- `disableScreenCaptureProtection()`
- `enableVerticalSwipes()`
- `disableVerticalSwipes()`
- `openCodeReader(fileSelect?)`
- `hapticImpact(...)`
- `hapticNotification(...)`
- `hapticSelectionChanged(...)`

### Проверки возможностей

- `isMaxBridgeAvailable()`: bridge уже доступен в текущем runtime
- `supportsMaxFeature(name)`: поддерживается ли конкретная возможность
- `isScreenCaptureProtected()`: текущее состояние screen capture flag

## Хелперы из `helpers.ts`

### Ошибки

- `createBridgeError(code, message?, details?)`: формирует единый error shape bridge-ошибки
- `isBridgeError(value)`: type guard для bridge errors
- `getErrorCode(value)`: приводит ошибку к строковому коду

### Работа с hash и стартовыми данными

- `getHashParam(hash, paramName)`: читает параметр из `location.hash`
- `extractParamFromHashes(paramName)`: ищет параметр в текущем hash и в navigation entry hash
- `readHashParamOrSessionStorage(paramName)`: берёт значение из hash или `sessionStorage`
- `parseInitData(rawInitData)`: парсит `WebAppData` в типизированный объект

### Версии

- `compareVersions(a, b)`: сравнивает версии MAX app
- `isVersionAtLeast(current, expected)`: проверяет минимальную версию

### Прочее

- `decodeMidToSharePayload(params)`: helper для преобразования `mid` в payload для MAX share

## Что важно в production

- `initDataUnsafe` нельзя использовать для доверенной серверной аутентификации
- для серверной проверки пользователя передавайте raw `initData`
- bridge methods лучше вызывать только после загрузки `max-web-app.js`
- методы `openLink`, `shareContent`, `downloadFile` лучше вызывать из user gesture
- `DeviceStorage` и `SecureStorage` могут быть недоступны в `web`
- `BiometricManager` требует предварительной проверки доступности и инициализации

## Минимальный пример

```tsx
"use client"

import { useBackButton, useHaptic, useMaxBridge } from "@/lib/max-bridge-gpt"
import { useRouter } from "next/navigation"

export function DemoPage() {
  const router = useRouter()
  const { available, user, platform } = useMaxBridge()
  const { impact } = useHaptic()

  useBackButton(() => router.back())

  if (!available) {
    return <p>MAX Bridge недоступен</p>
  }

  return (
    <button
      onClick={() => {
        void impact("medium")
      }}
    >
      {user?.first_name} / {platform}
    </button>
  )
}
```
