import { ChromaClient } from 'chromadb';
const collectionName = 'emi-node-collection';
async function runChroma() {
  const client = new ChromaClient();
  let collection;

  collection = await client.getOrCreateCollection({
    name: collectionName,
  });

  await collection.add({
    documents: [
      'this is a document about Ferrari',
      'this is a document about food and fruits. we have apples in the basket',
    ],
    metadatas: [
      {
        source: 'emi source',
      },
      {
        source: 'emi source',
      },
    ],
    ids: ['id1', 'id2'],
  });

  const result = await collection.query({
    queryTexts: ['do you have document about ferrari'],
    nResults: 2,
  });

  //console.log(result);

  result.documents.map((doc, index) => {
    console.log(doc);
    console.log(result.ids[index]);
  });
}

runChroma();
