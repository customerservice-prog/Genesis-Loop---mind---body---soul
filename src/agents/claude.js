const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Claude Agent
 * Takes a prompt + blueprint and generates ALL project files as a structured object
 */
async function buildProject(prompt, blueprint) {
  const systemPrompt = `You are an expert full-stack developer. You will be given a project blueprint and you must generate ALL the code files needed to build the project completely.

CRITICAL RULES:
- Output ONLY valid JSON in this exact format: { "files": { "filename": "content", ... } }
- Include EVERY file needed: backend, frontend, config, docker, railway.json, etc.
- Make the code production-ready, not just scaffolding
- Include proper error handling, environment variable usage, and comments
- The project must be deployable to Railway with zero manual changes
- Include a proper README.md

Do not output anything except the JSON object.`;

  const userMessage = `Project: ${prompt}

Blueprint:
${blueprint}

Generate all files as a JSON object with this structure:
{
  "files": {
    "path/to/file.js": "complete file content here",
    "another/file.html": "complete content",
    ...
  }
}`;

  const response = await anthropic.messages.create({
                                                       model: 'claude-opus-4-5',
                                                       max_tokens: 8000,
                                                       messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt
  });

  const content = response.content[0].text;

  // Extract JSON from response
  let jsonStr = content;
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) jsonStr = jsonMatch[1];

  const parsed = JSON.parse(jsonStr);
  return parsed.files || parsed;
}

module.exports = { buildProject };
