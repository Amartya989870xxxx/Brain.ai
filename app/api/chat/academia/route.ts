import { streamText, convertToModelMessages } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createClient } from '@supabase/supabase-js'
import { embedText } from '@/lib/gemini-embeddings'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()
    const lastMessage = messages[messages.length - 1]
    // Extract text from UIMessage parts format or legacy content format
    const lastMessageText = lastMessage.content || lastMessage.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ''

    const systemPrompt = `
You are Digital Academia, a brilliant, interactive AI mentor. 
Your goal is to teach the user anything they want to know, breaking down complex topics into easily digestible pieces.
Keep responses engaging, structured, and insightful.
`

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
      onFinish: async ({ text }) => {
        // Save the learned interaction to the Knowledge Vault asynchronously
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.log("Skipping Knowledge Vault sync: Missing credentials.")
            return
          }

          const supabase = createClient(supabaseUrl, supabaseKey)

          // Get authenticated user ID from session
          const authSupabase = await createSupabaseServerClient()
          const { data: { user } } = await authSupabase.auth.getUser()
          if (!user) {
            console.log("Skipping Knowledge Vault sync: No authenticated user.")
            return
          }
          const userId = user.id

          // Create a summary of this exact exchange to store as a knowledge chunk
          const learningChunk = `User Asked: ${lastMessageText}\n\nAcademia Taught: ${text}`

          // Generate embedding using direct Gemini API
          const embedding = await embedText(learningChunk)

          // Insert into Supabase knowledge_chunks table
          await supabase.from('knowledge_chunks').insert({
            user_id: userId,
            document_id: null,
            source_type: 'academia_chat',
            content: learningChunk,
            embedding,
          })
          
          console.log("Successfully etched new knowledge into the Vault!")
        } catch (err) {
          console.error("Failed to sync knowledge to vault:", err)
        }
      }
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error('Academia Chat Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
