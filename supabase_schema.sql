-- Brain.ai Database Schema for Supabase
-- Uses pgvector extension for similarity search
-- Embedding dimensions: 3072 (Google Gemini gemini-embedding-001)

-- 1. Enable pgvector extension
create extension if not exists vector with schema extensions;

-- 2. Create the documents table
create table
  documents (
    id bigserial primary key,
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null,
    user_id uuid not null,
    file_name text not null,
    summary text
  );

-- 3. Create the knowledge_chunks table with vector embeddings
create table
  knowledge_chunks (
    id bigserial primary key,
    document_id bigint references documents (id) on delete cascade null,
    user_id uuid not null,
    source_type text not null,
    content text not null,
    embedding vector (3072)
  );

-- 4. Create the similarity search function
create or replace function match_knowledge_chunks (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_chunks.id,
    knowledge_chunks.content,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where knowledge_chunks.user_id = p_user_id
    and 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- 5. Enable Row Level Security
alter table documents enable row level security;
alter table knowledge_chunks enable row level security;

-- 6. Create RLS Policies (for prototype, allow all access)
create policy "Allow all access to documents" on documents for all using (true);
create policy "Allow all access to knowledge_chunks" on knowledge_chunks for all using (true);
