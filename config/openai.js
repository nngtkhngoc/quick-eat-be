import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
async function wait_on_run(run, thread) {
  while (run.status === "queued" || run.status === "in_progress") {
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    await sleep(1000);
  }
  return run;
}
async function getAssistantResponse(prompt) {
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: prompt,
  });

  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID,
  });
  run = await wait_on_run(run, thread);
  const messages = await openai.beta.threads.messages.list(thread.id);
  const lastMessage = messages.data[0].content[0].text.value;
  return lastMessage;
}

export { getAssistantResponse };
