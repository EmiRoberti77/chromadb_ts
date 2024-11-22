import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { loadQAStuffChain } from 'langchain/chains';
import { OpenAI as LangchainOpenAI } from '@langchain/openai';
import { Document } from 'langchain/document';
import dotenv from 'dotenv';
dotenv.config();
const indexName = 'emi-pc-example-index';

const schedule = [
  '3/3/2024 6:00 AM - Wake Up',
  '3/3/2024 7:00 AM - Eat Breakfast',
  '3/3/2024 8:00 AM - Surrender to Canada',
  '3/3/2024 12:00 PM - Eat Lunch',
  '3/3/2024 5:00 PM - Go Home',
  '3/3/2024 6:00 PM - Eat Dinner',
  '3/3/2024 7:00 PM - Go to Sleep',
  '3/3/2024 8:00 PM - Dream',
];

async function main() {
  const pc = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const embedding = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
    batchSize: 100,
    model: 'text-embedding-3-small',
  });

  const index = pc.index(indexName);

  const scheduledEmbeddings = await embedding.embedDocuments(schedule);

  const scheduleVectors = scheduledEmbeddings.map((embedding, i) => ({
    id: 'emi-' + i,
    values: embedding,
    metadata: {
      text: schedule[i],
    },
  }));

  await index.upsert(scheduleVectors);

  const query = 'when do I go for lunch';

  const queryEmbedding = await embedding.embedQuery(query);
  console.log('queryEmbedding:', queryEmbedding.length);

  const response = await index.query({
    vector: queryEmbedding,
    topK: 2,
    includeMetadata: true,
  });

  const responses = response.matches.map((match: any) => {
    const data = match.metadata.text;
    console.log('data:', data);
    return data;
  });

  console.log('responses', responses);
  const concatenatedText = responses.join(' ');
  console.log('concatenatedText', concatenatedText);

  const llm = new LangchainOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const chain = loadQAStuffChain(llm);
  const result = await chain.call({
    input_documents: [
      new Document({ pageContent: concatenatedText, metadata: {} }),
    ],
    question: query,
  });

  console.log(result);
}

main().catch((err) => console.log(err));
