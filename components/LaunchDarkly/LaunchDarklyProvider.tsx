'use client'

import { HISTORY_FLAG_KEY, UPDATED_CHILDREN_CARD_FLAG_KEY } from '@/lib/flags'
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

const defaultFlags = {
  historyEnabled: false,
  updatedChildrenCard: false,
}

const FlagsContext = createContext(defaultFlags)

export function useHistoryEnabled() {
  return useContext(FlagsContext).historyEnabled
}

export function useUpdatedChildrenCard() {
  return useContext(FlagsContext).updatedChildrenCard
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

function FlagsBridge({ children }: { children: ReactNode }) {
  const historyEnabled = useBoolVariation(HISTORY_FLAG_KEY, false)
  const updatedChildrenCard = useBoolVariation(UPDATED_CHILDREN_CARD_FLAG_KEY, false)

  return (
    <FlagsContext.Provider value={{ historyEnabled, updatedChildrenCard }}>
      {children}
    </FlagsContext.Provider>
  )
}

export default function LaunchDarklyProvider({ children }: { children: ReactNode }) {
  if (!LDProvider) {
    return <FlagsContext.Provider value={defaultFlags}>{children}</FlagsContext.Provider>
  }

  return (
    <LDProvider>
      <IdentifyClerkUser>
        <FlagsBridge>{children}</FlagsBridge>
      </IdentifyClerkUser>
    </LDProvider>
  )
}
