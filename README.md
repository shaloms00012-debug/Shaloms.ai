# Shaloms AI

A Next.js starter for a colourful study assistant for Rwandan secondary students. It includes:
- Home page with your supplied portrait and the welcome credit.
- Quiz generation and automatic marking with explanations.
- Ask-a-question panel with text and image upload.
- A textbook library view for S1/S2/S3 Mathematics and S3 Physics.
- Server-side AI endpoints designed to use an OpenAI file-search vector store containing the uploaded books.

## 1. Requirements
- Node.js 20 or later
- An OpenAI API key with API access and billing enabled

## 2. Run locally
```bash
npm install
cp .env.example .env.local
```
Open `.env.local` and add your API key. Keep it secret; never add it to browser code or commit it to Git.

Then run:
```bash
npm run dev
```
Open http://localhost:3000.

## 3. Connect the textbooks to AI
The four supplied PDFs are in `knowledge/books/`. After setting `OPENAI_API_KEY` in your shell, run:
```bash
npm run knowledge:setup
```
The script uploads the PDFs and creates a vector store. Copy the printed `OPENAI_VECTOR_STORE_ID=...` into `.env.local`. Wait until the uploaded files finish indexing before testing answers. Restart the dev server after changing environment variables.

This creates a remote knowledge base in your OpenAI account. Check your provider's current pricing, data handling terms, and file limits before using it with students.

## 4. Important next steps before public launch
This is a functional starter, not yet a production school platform.
- Add student sign-in, a database, saved scores, rate limits, and abuse protection.
- Add a teacher/admin panel to manage textbooks and verify answer quality.
- Add Kiswahili/Kinyarwanda interface options if useful.
- Add accessibility checks and test on low-cost Android phones and slow connections.
- Do not collect students' personal information unless necessary; get appropriate consent and publish a privacy notice.
- The AI can make mistakes. Keep explanations and textbook references visible and encourage students to confirm uncertain work with a teacher.
- Confirm you have permission to redistribute textbook files before hosting the PDFs publicly. This starter uses them for the AI knowledge base, not as downloadable files in the UI.

## 5. Deploy
Deploy to a Node.js-compatible host such as Vercel. Set `OPENAI_API_KEY`, `OPENAI_VECTOR_STORE_ID`, and optionally `OPENAI_MODEL` in the host's server-side environment variables. Do not use `NEXT_PUBLIC_` for secrets.
