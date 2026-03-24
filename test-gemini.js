const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text: "Hello world" }] }
    })
  });
  console.log(await res.json());
}
test();
