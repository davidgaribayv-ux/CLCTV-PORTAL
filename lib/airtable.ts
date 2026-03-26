// ─────────────────────────────────────────────────────────────────────────────
// Capa de acceso a datos — Airtable REST API v0
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.airtable.com/v0'
const API_KEY = process.env.AIRTABLE_API_KEY!
const BASE_ID = process.env.AIRTABLE_BASE_ID!
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Posts'

if (!API_KEY || !BASE_ID) {
  throw new Error('Faltan variables de entorno: AIRTABLE_API_KEY y AIRTABLE_BASE_ID son obligatorias.')
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PostStatus = 'Pendiente' | 'Aprobado' | 'Rechazado'

export interface PostFields {
  ID?: number
  Image_URL: string
  Caption: string
  Scheduled_Date: string  // ISO 8601, ej: "2025-04-15"
  Status: PostStatus
  Feedback?: string
  Client_Slug: string     // Campo extra: slug del cliente, ej: "maymanta"
}

export interface Post {
  id: string              // Record ID de Airtable (recXXXXXXX)
  fields: PostFields
  createdTime: string
}

interface AirtableResponse {
  records: Post[]
  offset?: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Trae TODOS los posts de un cliente (sin filtrar por status).
 * El filtrado visual se hace en el frontend con tabs.
 */
export async function getPostsByClient(clientSlug: string): Promise<Post[]> {
  const formula = encodeURIComponent(`{Client_Slug}="${clientSlug}"`)
  const sort = encodeURIComponent('Scheduled_Date')

  const url = `${BASE_URL}/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${formula}&sort[0][field]=${sort}&sort[0][direction]=asc`

  const res = await fetch(url, {
    headers,
    // Sin cache: siempre datos frescos
    cache: 'no-store',
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Airtable error ${res.status}: ${error}`)
  }

  const data: AirtableResponse = await res.json()
  return data.records
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function approvePost(recordId: string): Promise<void> {
  await patchRecord(recordId, { Status: 'Aprobado' })
}

export async function rejectPost(recordId: string, feedback: string): Promise<void> {
  await patchRecord(recordId, { Status: 'Rechazado', Feedback: feedback })
}

async function patchRecord(recordId: string, fields: Partial<PostFields>): Promise<void> {
  const url = `${BASE_URL}/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${recordId}`

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`No se pudo actualizar el registro ${recordId}: ${error}`)
  }
}
