import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: '' });
async function run() {
  const response = await ai.models.list();
  for await (const model of response) {
    console.log(model.name);
  }
}
run().catch(console.error);
