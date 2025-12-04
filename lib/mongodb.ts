import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not set in the environment');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'leetcode-pre';
  return mongoClient.db(dbName);
}

export interface UserQuestionState {
  userId: string;
  questionId: string;
  done: boolean;
  note: string;
  updatedAt: Date;
}


