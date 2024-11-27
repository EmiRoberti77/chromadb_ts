### Description of ChromaDB

ChromaDB is an advanced, open-source vector database designed to store, manage, and query high-dimensional vector embeddings efficiently. It powers applications in machine learning, natural language processing (NLP), recommendation systems, and other AI-driven domains. By leveraging vector embeddings—numerical representations of data—it enables similarity searches, clustering, and semantic analysis.

At its core, ChromaDB facilitates fast, scalable, and accurate querying of vectors, making it a critical component for applications like document search, image retrieval, and personalized recommendations.

### How ChromaDB Works

ChromaDB operates on the principle of managing vector embeddings, which are mathematical representations of data (text, images, etc.) in a multi-dimensional space. Here's a high-level breakdown of its functioning:

1. Vectorization of Data
   Input Data: ChromaDB works with vectors derived from raw data (e.g., text, images, or audio).
   Embeddings: Data is processed through pre-trained machine learning models (e.g., OpenAI's GPT, Hugging Face models) to produce embeddings.
   Example: A sentence like "What is a Ferrari?" is converted into a 512-dimensional vector.

2. Storage of Vectors
   Collections: Vectors are grouped into collections, which are organizational units in ChromaDB. Each collection stores:
   Vectors (numerical embeddings).
   Associated metadata (e.g., source information, document ID).
   Document IDs (unique identifiers for each vector).
   ChromaDB stores these efficiently, enabling rapid retrieval and scaling across large datasets.

3. Indexing and Retrieval
   Indexing: Vectors are indexed using highly optimized algorithms like Approximate Nearest Neighbor (ANN) search.
   Querying: Users query ChromaDB using embeddings or raw query texts, and ChromaDB compares these against stored vectors to find the most similar ones.
   Example: Searching for "Italian cars" might return a vector associated with "Ferrari" because their embeddings are close in vector space.

<img width="929" alt="Screenshot 2024-11-27 at 08 18 40" src="https://github.com/user-attachments/assets/0bf63f21-744b-4414-b8c5-fcf28095357b">

5. Metadata-Enhanced Search
   ChromaDB allows searches based on metadata in addition to vector similarity. This enables powerful filtering, like retrieving vectors based on specific attributes (e.g., source, category).

6. Applications and Workflows
   Data Ingestion: Users add vectors and metadata to collections.
   Query Execution: Queries are run against the collections to fetch relevant vectors and associated data.
   Integration: ChromaDB integrates seamlessly with AI models to build advanced search engines, recommendation systems, and clustering tools.

## Aplication workflow

   <img width="793" alt="Screenshot 2024-11-27 at 08 17 45" src="https://github.com/user-attachments/assets/17ae0743-2636-422f-b5bb-4ac862792141">

## Practical example of how to use chroma db

install database first

```bash
python3 -m venv chroma_env
source chroma_env/bin/activate
pip install chromadb
chroma run
```

<img width="686" alt="Screenshot 2024-11-18 at 07 21 25" src="https://github.com/user-attachments/assets/25fb83f8-ac4d-40e2-89b4-79fe642af71d">

## set up node project

```bash
npm init -yes
npm i -D @types/node typescript ts-node
npm i chromadb chromadb-default-embed
```

Code Explanation
The example below demonstrates the basic usage of ChromaDB in a Node.js environment.

1. Import the ChromaDB Client
   Start by importing the ChromaClient class from the chromadb library.

```typescript
import { ChromaClient } from 'chromadb';
```

2. Initialize the ChromaDB Client
   Create a new instance of the ChromaDB client.

```typescript
const client = new ChromaClient();
```

3. Create or Retrieve a Collection
   Use the getOrCreateCollection method to either retrieve an existing collection or create a new one if it doesn't exist. In this example, the collection is named emi-node-collection.

```typescript
const collectionName = 'emi-node-collection';

const collection = await client.getOrCreateCollection({
  name: collectionName,
});
```

4. Add Documents to the Collection
   Add documents with metadata and unique IDs to the collection. This allows you to store text data for querying.

```typescript
await collection.add({
  documents: [
    'this is a document about Ferrari',
    'this is a document about food and fruits. we have apples in the basket',
  ],
  metadatas: [{ source: 'emi source' }, { source: 'emi source' }],
  ids: ['id1', 'id2'],
});
```

5. Query the Collection
   Query the collection for documents that match a specific query text. The nResults parameter determines how many relevant documents to retrieve.

```javascript
const result = await collection.query({
  queryTexts: ['do you have document about ferrari'],
  nResults: 2,
});
```

6. Process Query Results
   The query returns a result object, containing the documents and their IDs. Iterate over the results to process them.

```javascript
result.documents.map((doc, index) => {
  console.log(doc); // Document text
  console.log(result.ids[index]); // Document ID
});
```
