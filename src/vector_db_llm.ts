import dotenv from 'dotenv';
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from 'chromadb';
import fs from 'fs';
import path, { join } from 'path';
import OpenAI from 'openai';
dotenv.config();
const openai_api_key = process.env.OPENAI_API_KEY;

if (!openai_api_key) {
  console.log('Error:openai_key_missing');
  process.exit();
}

const openai = new OpenAI({
  apiKey: openai_api_key,
});

const DB_PATH = './chroma_data';
const DATA = './data/new_articles';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const COLLECTION_NAME = 'emi_chroma_collection';
const EXT = '.txt';

interface Doc {
  id: string;
  text: string;
}

interface VectorDoc {
  id: string;
  text: string;
  embedding?: string;
}

const client = new ChromaClient();
let collection: any;
const openAiEmbedFunction = new OpenAIEmbeddingFunction({
  openai_api_key: openai_api_key,
  openai_model: EMBEDDING_MODEL,
});

async function loadDataFromDir(): Promise<Doc[]> {
  const documents: VectorDoc[] = [];
  const files = fs.readdirSync(DATA);
  await Promise.all(
    files.map(async (f) => {
      if (f.endsWith(EXT)) {
        documents.push({
          id: f,
          text: fs.readFileSync(path.join(DATA, f)).toString('utf-8'),
        });
      }
    })
  );
  console.log(documents);
  return documents;
}

async function upsertToChroma(docs: VectorDoc[]) {
  const ids = docs.map((doc) => doc.id);
  const documents = docs.map((doc) => doc.text);
  const embeddings = await Promise.all(docs.map((doc) => embedding(doc.text)));
  const metadatas = docs.map(() => ({}));
  await collection.add({
    ids,
    documents,
    embeddings,
    metadatas,
  });

  console.log(`data added to chroma db ${docs.length}`);
}

async function splitText(
  text: string,
  chunk_size: number = 1000,
  offset: number = 20
): Promise<string[]> {
  const chunk: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunk_size;
    chunk.push(text.slice(start, end));
    start = end;
  }
  return chunk;
}

async function embedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    input: text,
    model: EMBEDDING_MODEL,
  });
  console.log('===== embedding ======');
  return response.data[0].embedding;
}

async function chuckTheDocuments(documents: Doc[]) {
  const chunks: VectorDoc[] = [];
  await Promise.all(
    documents.map(async (doc: Doc, index: number) => {
      console.log(`====== splitting document ${index} ======`);
      const docChunks = await splitText(doc.text);
      docChunks.map(async (chunk: string, index) => {
        chunks.push({
          id: doc.id + '-' + index,
          text: chunk,
        });
      });
    })
  );
  return chunks;
}

async function createDataBase(): Promise<boolean> {
  collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: openAiEmbedFunction,
  });

  if (!collection) {
    return false;
  }
  return false;
}

async function queryDocument(question: string, nResults = 3) {
  const result = await collection.query({
    queryTexts: [question],
    nResults,
  });

  // result.documents.map((doc: any, index: number) => {
  //   console.log(doc);
  //   console.log(result.ids[index]);
  // });

  return result.documents;
}

async function generateResponse(question: string, relevant_chunks: any[]) {
  const context = relevant_chunks.join('\n\n');
  const prompt = `You are an assistant for question-answering tasks. Use the following pieces of 
  retrieved context to answer the question. If you don't know the answer, say that you 
  don't know. Use three sentences maximum and keep the answer concise.
  \n\nContext:${context}\n\nQuestion:${question}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const answer = response.choices[0].message.content;
  return answer;
}

async function main() {
  await createDataBase();
  const documents = await loadDataFromDir();
  const preppedData = await chuckTheDocuments(documents);
  await upsertToChroma(preppedData);
  const question = 'tell me about the tech companies';
  const relevantDocs = await queryDocument(question);
  const answer = await generateResponse(question, relevantDocs);
  console.log(answer);
}

main();
