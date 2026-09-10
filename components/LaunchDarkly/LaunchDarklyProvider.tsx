'use client'

import { HISTORY_FLAG_KEY } from '@/lib/flags'
import {
  ANONYMOUS_LD_CONTEXT,
  LD_CONTEXT_REFRESH_EVENT,
  buildClerkOnlyUserContext,
} from '@/lib/ld-context'
import { useUser } from '@clerk/nextjs'
import {
  createLDReactProvider,
  useBoolVariation,
  useLDClient,
} from '@launchdarkly/react-sdk'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const clientSideID = process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID?.trim() ?? ''

const LDProvider = clientSideID
  ? createLDReactProvider(
      clientSideID,
      ANONYMOUS_LD_CONTEXT,
      {
        deferInitialization: true,
        ldOptions: { streaming: true },
      }
    )
  : null

const HistoryEnabledContext = createContext(false)

export function useHistoryEnabled() {
  return useContext(HistoryEnabledContext)
}

function IdentifyClerkUser({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const ldClient = useLDClient()
  const pathname = usePathname()
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    const onRefresh = () => setRefreshToken((value) => value + 1)
    window.addEventListener(LD_CONTEXT_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(LD_CONTEXT_REFRESH_EVENT, onRefresh)
  }, [])

  useEffect(() => {
    let cancelled = false

    const startAndIdentify = async () => {
      if (!ldClient.isReady()) {
        await ldClient.start()
      }
      if (cancelled || !isLoaded) return

      if (!user) {
        await ldClient.identify(ANONYMOUS_LD_CONTEXT)
        return
      }

      const fallback = buildClerkOnlyUserContext({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        createdAt: user.createdAt,
      })

      try {
        const res = await fetch('/api/ld-context')
        const context = await res.json()
        if (cancelled) return
        if (res.ok && context?.kind) {
          await ldClient.identify(context)
          return
        }
      } catch {
        // Use Clerk-only attributes if the household payload cannot be loaded.
      }

      if (!cancelled) {
        await ldClient.identify(fallback)
      }
    }

    void startAndIdentify()
    return () => {
      cancelled = true
    }
  }, [isLoaded, user, ldClient, pathname, refreshToken])

  return <>{children}</>
}

function HistoryFlagBridge({ children }: { children: ReactNode }) {
  const enabled = useBoolVariation(HISTORY_FLAG_KEY, false)

  return (
    <HistoryEnabledContext.Provider value={enabled}>
      {children}
    </HistoryEnabledContext.Provider>
  )
}

export default function LaunchDarklyProvider({ children }: { children: ReactNode }) {
  if (!LDProvider) {
    return (
      <HistoryEnabledContext.Provider value={false}>{children}</HistoryEnabledContext.Provider>
    )
  }

  return (
    <LDProvider>
      <IdentifyClerkUser>
        <HistoryFlagBridge>{children}</HistoryFlagBridge>
      </IdentifyClerkUser>
    </LDProvider>
  )
}
