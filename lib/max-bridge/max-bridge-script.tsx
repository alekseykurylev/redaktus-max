// ─────────────────────────────────────────────────────────────
// MAX Bridge — Next.js Script Loader
// Add <MaxBridgeScript /> to your root layout once.
// ─────────────────────────────────────────────────────────────

import Script from "next/script"

/**
 * Loads the MAX Bridge library (`max-web-app.js`) from the MAX CDN.
 *
 * Place this component **once** in your root layout:
 *
 * ```tsx
 * // app/layout.tsx
 * import { MaxBridgeScript } from "@/lib/max-bridge";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <MaxBridgeScript />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function MaxBridgeScript() {
  return <Script src="https://st.max.ru/js/max-web-app.js" strategy="beforeInteractive" />
}
