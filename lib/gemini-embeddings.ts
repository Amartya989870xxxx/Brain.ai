/**
 * Direct Google Gemini Embedding Helper
 * Bypasses Vercel AI SDK which uses outdated model names.
 * Uses the native Google Generative AI REST API directly.
 */

const GEMINI_EMBED_MODEL = 'gemini-embedding-001'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

function getApiKey(): string {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local')
  return key
}

/**
 * Generate an embedding for a single text string.
 * Returns a float array of 3072 dimensions.
 */
export async function embedText(text: string): Promise<number[]> {
  const apiKey = getApiKey()
  const url = `${GEMINI_API_BASE}/models/${GEMINI_EMBED_MODEL}:embedContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBED_MODEL}`,
      content: { parts: [{ text }] },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Gemini Embedding Error: ${err.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.embedding.values
}

/**
 * Generate embeddings for multiple text strings in batch.
 * Uses the batchEmbedContents endpoint for efficiency.
 * Returns an array of float arrays, each 3072 dimensions.
 */
export async function embedMany(texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey()
  const url = `${GEMINI_API_BASE}/models/${GEMINI_EMBED_MODEL}:batchEmbedContents?key=${apiKey}`

  const requests = texts.map((text) => ({
    model: `models/${GEMINI_EMBED_MODEL}`,
    content: { parts: [{ text }] },
  }))

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Gemini Batch Embedding Error: ${err.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.embeddings.map((e: any) => e.values)
}
