export function normalizePrivateKey(raw: string): string

export type ServiceAccountCredential = {projectId: string | undefined; clientEmail: string; privateKey: string}

export type ServiceAccountResult =
  | {
      ok: true
      source: 'env' | 'json' | 'application_default'
      credential: ServiceAccountCredential | null
      emailProject?: string
      warnings: string[]
    }
  | {ok: false; problem: string; warnings: string[]}

export function readServiceAccount(env?: Record<string, string | undefined>): ServiceAccountResult
