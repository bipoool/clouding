// Type definitions for objects with expiry metadata
interface ExpiryMetadata {
  expiresAt?: string
  [key: string]: any
}

interface ObjectWithExpiry {
  metadata?: ExpiryMetadata
  [key: string]: any
}

const toUTCISOString = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr // fallback – leave unchanged
  // Force 00:00:00 UTC so backend gets deterministic value
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString().replace(/\.\d{3}/, '') // e.g. 2025-08-15T00:00:00Z
}

const toClientISOString = (utcStr: string): string => {
  const date = new Date(utcStr)
  if (isNaN(date.getTime())) return utcStr
  return date.toISOString() // client will parse & display in local zone
}

const convertExpiryToUTC = (payload: ObjectWithExpiry): void => {
  if (payload?.metadata?.expiresAt) {
    payload.metadata.expiresAt = toUTCISOString(payload.metadata.expiresAt)
  }
}

const convertExpiryToClient = <T extends ObjectWithExpiry>(obj: T): T => {
  if (!obj?.metadata?.expiresAt) {
    return obj
  }
  
  return {
    ...obj,
    metadata: {
      ...obj.metadata,
      expiresAt: toClientISOString(obj.metadata.expiresAt)
    }
  }
}

export { toUTCISOString, toClientISOString, convertExpiryToUTC, convertExpiryToClient } 