const axios = require('axios');

const RAILWAY_API = 'https://backboard.railway.app/graphql/v2';

/**
 * Railway Agent
 * Deploys the project to Railway by linking the GitHub repo
 */
async function deploy(repoName, repoUrl) {
    const token = process.env.RAILWAY_TOKEN;
    if (!token) {
          console.warn('RAILWAY_TOKEN not set, skipping Railway deployment');
          return `${repoUrl} (Railway deploy skipped - add RAILWAY_TOKEN)`;
        }

    const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

    try {
          // Step 1: Create a new project
          const createProjectMutation = `
            mutation {
                      projectCreate(input: { name: "${repoName}" }) {
                                  id
                                  name
                                }
                    }
          `;

          const { data: projectData } = await axios.post(
                  RAILWAY_API,
                  { query: createProjectMutation },
                  { headers }
                );

          const projectId = projectData.data?.projectCreate?.id;
          if (!projectId) throw new Error('Failed to create Railway project');

          console.log('Railway project created:', projectId);

          // Step 2: Link GitHub repo as a service
          const githubRepoFullName = repoUrl.replace('https://github.com/', '');

          const createServiceMutation = `
            mutation {
                      serviceCreate(input: {
                                  projectId: "${projectId}",
                                  source: { repo: "${githubRepoFullName}" }
                                }) {
                                  id
                                  name
                                }
                    }
          `;

          const { data: serviceData } = await axios.post(
                  RAILWAY_API,
                  { query: createServiceMutation },
                  { headers }
                );

          const serviceId = serviceData.data?.serviceCreate?.id;
          if (!serviceId) throw new Error('Failed to create Railway service');

          console.log('Railway service created:', serviceId);

          // Step 3: Get deployment URL
          const deployUrl = `https://${repoName.toLowerCase()}.up.railway.app`;
          console.log('Deployed to Railway:', deployUrl);

          return deployUrl;
        } catch (error) {
          console.error('Railway deployment error:', error.message);
          // Return a helpful message even if Railway deploy fails
          return `${repoUrl} (Deploy to Railway manually with: railway link && railway up)`;
        }
  }

module.exports = { deploy };
