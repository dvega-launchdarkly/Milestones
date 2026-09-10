'use client'

import { HISTORY_FLAG_KEY } from '@/lib/flags'
import { useUser } from '@clerk/nextjs'
import {
  createLDReactProvider,
  useBoolVariation,
  useLDClient,
} from '@launchdarkly/react-sdk'
import { createContext, useContext, useEffect, type ReactNode } from 'react'

const clientSideID = process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID?.trim() ?? ''

const LDProvider = clientSideID
  ? createLDReactProvider(
      clientSideID,
      { kind: 'user', key: 'anonymous', anonymous: true },
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

  useEffect(() => {
    let cancelled = false

    const startAndIdentify = async () => {
      if (!ldClient.isReady()) {
        await ldClient.start()
      }
      if (cancelled || !isLoaded) return

      if (user) {
        await ldClient.identify({
          kind: 'user',
          key: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName ?? undefined,
        })
        return
      }

      await ldClient.identify({ kind: 'user', key: 'anonymous', anonymous: true })
    }

    void startAndIdentify()
    return () => {
      cancelled = true
    }
  }, [isLoaded, user, ldClient])

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
