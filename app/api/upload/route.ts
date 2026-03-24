import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { embedMany } from '@/lib/gemini-embeddings'
import PDFParser from 'pdf2json'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Ensure this runs on Node.js 
export const runtime = 'nodejs'

// Basic text chunker
function chunkText(text: string, chunkSize = 1000, overlap = 200) {
  const chunks = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize))
    i += chunkSize - overlap
  }
  return chunks
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase credentials missing in .env.local' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get authenticated user ID from session
    const authSupabase = await createSupabaseServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.id

    // Check limit of 20 documents
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      
    if (count !== null && count >= 20) {
      return NextResponse.json({ error: 'Maximum limit of 20 documents reached.' }, { status: 403 })
    }

    // Parse text
    let text = ''
    if (file.type === 'application/pdf') {
       const buffer = Buffer.from(await file.arrayBuffer())
       text = await new Promise<string>((resolve, reject) => {
         const pdfParser = new PDFParser(null, true)
         pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError))
         pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()))
         pdfParser.parseBuffer(buffer)
       })
    } else {
      text = await file.text()
    }

    if (!text.trim()) return NextResponse.json({ error: 'Empty document' }, { status: 400 })

    // Generate Chunks
    const chunks = chunkText(text, 1000, 200)

    // Generate Embeddings using direct Gemini API (gemini-embedding-001, 3072 dimensions)
    const embeddings = await embedMany(chunks)

    // Insert Document Record
    const { data: docRecord, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.name,
        summary: chunks[0].substring(0, 200) + '...', // Simple summary for now
      })
      .select('id')
      .single()

    if (docError) throw new Error(docError.message)

    // Insert Chunks into pgvector
    const chunkRecords = chunks.map((content, i) => ({
      user_id: userId,
      document_id: docRecord.id,
      source_type: 'upload',
      content,
      embedding: embeddings[i],
    }))

    const { error: chunkError } = await supabase.from('knowledge_chunks').insert(chunkRecords)
    if (chunkError) throw new Error(chunkError.message)

    return NextResponse.json({ success: true, documentId: docRecord.id })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
