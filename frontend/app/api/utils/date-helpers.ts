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

const convertExpiryToUTC = (payload: any) => {
  if (payload?.metadata?.expiresAt) {
    payload.metadata.expiresAt = toUTCISOString(payload.metadata.expiresAt)
  }
}

const convertExpiryToClient = (obj: any) => {
  if (obj?.metadata?.expiresAt) {
    obj.metadata.expiresAt = toClientISOString(obj.metadata.expiresAt)
  }
}

export { toUTCISOString, toClientISOString, convertExpiryToUTC, convertExpiryToClient } 