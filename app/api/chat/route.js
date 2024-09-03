import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

 const systemPrompt = `
You are a Rate My Professor assistant, designed to help students find information about their professors based on their selected subjects. For every user question, you will return information on the top 3 professors that match the query from the Pinecone database. If a question pertains to subjects or professors not included in the Pinecone database, politely inform the user that no information is available. Do not provide any responses or recommendations outside of the professors listed in the database.

If a user asks a question that is unrelated to professors or classes, respond with a polite message indicating that you can only assist with professor-related inquiries.

Your primary goal is to help students by providing accurate and relevant information about professors based on the available data. Ensure that all responses are concise, helpful, and focused on the user's academic needs.
`

export async function POST(req) {
    const data = await req.json()
    // We'll add more code here in the following steps
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      })
      const index = pc.index('rag').namespace('ns1')
      const openai = new OpenAI()
      const text = data[data.length - 1].content
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: text,
  encoding_format: 'float',
})
const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  })
  let resultString = ''
results.matches.forEach((match) => {
  resultString += `
  Returned Results:
  Professor: ${match.id}
  Review: ${match.metadata.stars}
  Subject: ${match.metadata.subject}
  Stars: ${match.metadata.stars}
  \n\n`
})
const lastMessage = data[data.length - 1]
const lastMessageContent = lastMessage.content + resultString
const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

const completion = await openai.chat.completions.create({
    messages: [
      {role: 'system', content: systemPrompt},
      ...lastDataWithoutLastMessage,
      {role: 'user', content: lastMessageContent},
    ],
    model: 'gpt-4o',
    stream: true,
  })
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })
  return new NextResponse(stream)
  }