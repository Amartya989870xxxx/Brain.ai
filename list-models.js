const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    const embeddingModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent'));
    console.log('=== EMBEDDING MODELS ===');
    embeddingModels.forEach(m => console.log(m.name, '-', m.displayName, '-', m.supportedGenerationMethods));
    console.log('\n=== ALL MODELS (first 20) ===');
    data.models.slice(0, 20).forEach(m => console.log(m.name, '-', m.supportedGenerationMethods));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
listModels();
