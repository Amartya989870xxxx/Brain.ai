import { streamText, convertToModelMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createClient } from '@supabase/supabase-js'
import { embedText } from '@/lib/gemini-embeddings'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()
    const lastMessage = messages[messages.length - 1]
    // Extract text from UIMessage parts format or legacy content format
    const lastMessageText = lastMessage.content || lastMessage.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ''

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let contextText = ''

    if (supabaseUrl && supabaseKey && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Get authenticated user ID from session
      const authSupabase = await createSupabaseServerClient()
      const { data: { user } } = await authSupabase.auth.getUser()
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      const userId = user.id

      // 1. Embed the user's query using direct Gemini API
      const embedding = await embedText(lastMessageText)

      // 2. Search Supabase via pgvector
      const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
        p_user_id: userId
      })

      if (!error && chunks && chunks.length > 0) {
        contextText = chunks.map((c: any) => c.content).join('\n\n')
      }
    } else {
      contextText = "[System Warning: Database or API Keys are not configured. Cannot retrieve context.]"
    }

    const systemPrompt = `
You are the Brain.ai Knowledge Vault assistant.
You must answer the user's question simply but with detailed explanations.
CRUCIAL: You must base your answer ONLY on the provided Context below. If the context doesn't contain the answer, say you don't know based on the uploaded documents.

--- CONTEXT START ---
${contextText}
--- CONTEXT END ---
`

    // Use Gemini 2.0 Flash Lite by default
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
    })
    const aiModel = google('gemini-2.5-flash')

    // Convert UIMessages to model messages for the AI SDK
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error('Vault Chat Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
