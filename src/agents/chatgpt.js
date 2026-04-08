const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * ChatGPT Agent
 * Takes a user prompt and returns a detailed, structured project blueprint
 */
async function getBluePrint(prompt) {
  const systemPrompt = `You are an expert software architect. When given a project idea, 
you produce a DETAILED, STRUCTURED blueprint that another AI can use to build it completely from scratch.

Your blueprint must include:
1. PROJECT OVERVIEW: What it is, tech stack, architecture
  2. FILE STRUCTURE: Complete directory tree with all files
3. DEPENDENCIES: All npm packages needed with versions
4. ENVIRONMENT VARIABLES: All required env vars with descriptions
5. DETAILED IMPLEMENTATION: For each file, describe exactly what it should contain, all functions, routes, components
  6. DATABASE SCHEMA: If applicable
7. API ENDPOINTS: All routes with request/response shapes
8. DEPLOYMENT CONFIG: Railway/Docker config needed
9. STEP-BY-STEP BUILD ORDER: Sequence to build the files

Be extremely detailed. The receiving AI will build this without any human help.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
{ role: 'system', content: systemPrompt },
{ role: 'user', content: `Build me: ${prompt}` }
    ],
    max_tokens: 4000,
    temperature: 0.3
});

  return response.choices[0].message.content;
}

module.exports = { getBluePrint };
