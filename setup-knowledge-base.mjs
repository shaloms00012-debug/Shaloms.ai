import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY. Set it in your environment before running this script.");
  process.exit(1);
}
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const dir = path.resolve("knowledge/books");
const books = fs.readdirSync(dir).filter(name => name.toLowerCase().endsWith(".pdf"));
if (!books.length) {
  console.error("No PDFs found in knowledge/books.");
  process.exit(1);
}
const store = await client.vectorStores.create({ name: "Shaloms AI — Rwanda REB Mathematics and Physics" });
console.log(`Created vector store: ${store.id}`);
for (const book of books) {
  console.log(`Uploading ${book}...`);
  const uploaded = await client.files.create({
    file: fs.createReadStream(path.join(dir, book)),
    purpose: "assistants"
  });
  await client.vectorStores.files.create(store.id, { file_id: uploaded.id });
}
console.log("\\nAll book files have been attached. Indexing may take a little time.");
console.log("Add this to .env.local after the vector store finishes processing:");
console.log(`OPENAI_VECTOR_STORE_ID=${store.id}`);
