const chatgptAgent = require('./agents/chatgpt');
const claudeAgent = require('./agents/claude');
const githubAgent = require('./agents/github');
const railwayAgent = require('./agents/railway');
const { generateRepoName } = require('./utils/nameGenerator');

/**
 * Genesis Loop Orchestrator
  * Chains: ChatGPT -> Claude -> GitHub -> Cursor -> Railway
   */
   async function runPipeline(prompt, sessionId, io) {
     const emit = (step, data) => {
         io.to(sessionId).emit('progress', { step, ...data });
             console.log(`[${sessionId}] [${step}]`, data.message || '');
               };

                 emit('start', { message: `Starting Genesis Loop for: "${prompt}"`, status: 'running' });

                   // STEP 1: ChatGPT generates the full build plan
                     emit('chatgpt', { message: 'Asking ChatGPT for full project blueprint...', status: 'running' });
                       const blueprint = await chatgptAgent.getBluePrint(prompt);
                         emit('chatgpt', { message: 'Blueprint received from ChatGPT', status: 'done', blueprint });

                           // STEP 2: Claude Code generates all project files
                             emit('claude', { message: 'Claude is building the entire project...', status: 'running' });
                               const projectFiles = await claudeAgent.buildProject(prompt, blueprint);
                                 emit('claude', { message: `Claude generated ${Object.keys(projectFiles).length} files`, status: 'done' });

                                   // STEP 3: Push to GitHub
                                     const repoName = generateRepoName(prompt);
                                       emit('github', { message: `Creating GitHub repo: ${repoName}...`, status: 'running' });
                                         const repoUrl = await githubAgent.createAndPush(repoName, projectFiles, prompt);
                                           emit('github', { message: `Pushed to GitHub: ${repoUrl}`, status: 'done', repoUrl });

                                             // STEP 4: Open in Cursor (local deep link)
                                               emit('cursor', { message: 'Opening project in Cursor IDE...', status: 'running' });
                                                 const cursorLink = `cursor://file/${repoName}`;
                                                   emit('cursor', {
                                                       message: 'Cursor link ready. Click the button below to open in Cursor.',
                                                           status: 'done',
                                                               cursorLink,
                                                                   repoUrl
                                                                     });

                                                                       // STEP 5: Deploy to Railway
                                                                         emit('railway', { message: 'Deploying to Railway...', status: 'running' });
                                                                           const deployUrl = await railwayAgent.deploy(repoName, repoUrl);
                                                                             emit('railway', { message: `Live at: ${deployUrl}`, status: 'done', deployUrl });

                                                                               // Final success
                                                                                 emit('complete', {
                                                                                     message: 'Genesis Loop complete! Your app is live.',
                                                                                         status: 'done',
                                                                                             repoUrl,
                                                                                                 deployUrl,
                                                                                                     cursorLink
                                                                                                       });
                                                                                                       
                                                                                                         return { repoUrl, deployUrl, cursorLink };
                                                                                                         }
                                                                                                         
                                                                                                         module.exports = { runPipeline };
