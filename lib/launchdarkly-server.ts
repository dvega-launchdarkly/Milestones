import { basicLogger, init, type LDClient } from '@launchdarkly/node-server-sdk'
import { HISTORY_FLAG_KEY, RELEASE_INVITE_FAMILY_FLAG_KEY } from './flags'
import { getLdContextForCurrentUser } from './ld-context-server'

const globalForLD = globalThis as unknown as { ldClient?: LDClient; ldReady?: Promise<LDClient | null> }

function getSdkKey() {
  return process.env.LAUNCHDARKLY_SDK_KEY?.trim() || undefined
}

async function getServerClient(): Promise<LDClient | null> {
  const sdkKey = getSdkKey()
  if (!sdkKey) return null
  if (globalForLD.ldClient) return globalForLD.ldClient
  if (!globalForLD.ldReady) {
    const client = init(sdkKey, {
      logger: basicLogger({ level: 'warn' }),
    })
    globalForLD.ldReady = client
      .waitForInitialization({ timeout: 5 })
      .then(() => {
        globalForLD.ldClient = client
        return client
      })
      .catch(() => null)
  }
  return globalForLD.ldReady
}

async function isFlagEnabled(flagKey: string): Promise<boolean> {
  const client = await getServerClient()
  if (!client) return false

  try {
    const context = await getLdContextForCurrentUser()
    return await client.variation(flagKey, context, false)
  } catch {
    return false
  }
}

export async function isHistoryEnabled(): Promise<boolean> {
  return isFlagEnabled(HISTORY_FLAG_KEY)
}

export async function isInviteFamilyEnabled(): Promise<boolean> {
  return isFlagEnabled(RELEASE_INVITE_FAMILY_FLAG_KEY)
}
