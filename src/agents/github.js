const { Octokit } = require('octokit');

/**
 * GitHub Agent
 * Creates a new repo and pushes all generated project files
 */
async function createAndPush(repoName, files, description) {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Get authenticated user
  const { data: user } = await octokit.rest.users.getAuthenticated();
    const owner = user.login;

  // Create the repository
  await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: `Genesis Loop: ${description}`,
        private: false,
        auto_init: false
  });

  console.log(`Created repo: ${owner}/${repoName}`);

  // Create all files via GitHub API
  const fileEntries = Object.entries(files);

  // We need to push files as a tree commit for efficiency
  // First get/create the base commit
  let sha = null;
    try {
          const { data: ref } = await octokit.rest.git.getRef({
                  owner,
                  repo: repoName,
                  ref: 'heads/main'
          });
          sha = ref.object.sha;
    } catch (e) {
          // Repo is empty, no initial commit yet
    }

  // Create blobs for each file
  const treeItems = await Promise.all(
        fileEntries.map(async ([path, content]) => {
                const { data: blob } = await octokit.rest.git.createBlob({
                          owner,
                          repo: repoName,
                                content: Buffer.from(content).toString('base64'),
                          encoding: 'base64'
                });
                return {
                          path,
                          mode: '100644',
                          type: 'blob',
                          sha: blob.sha
                };
        })
      );

  // Create tree
  const { data: tree } = await octokit.rest.git.createTree({
        owner,
        repo: repoName,
        tree: treeItems,
                                      base_tree: sha || undefined
  });

  // Create commit
  const { data: commit } = await octokit.rest.git.createCommit({
        owner,
        repo: repoName,
        message: 'Initial commit by Genesis Loop',
        tree: tree.sha,
        parents: sha ? [sha] : []
  });

              // Update/create main branch ref
  try {
        await octokit.rest.git.updateRef({
                owner,
                repo: repoName,
                ref: 'heads/main',
                sha: commit.sha
        });
  } catch (e) {
              await octokit.rest.git.createRef({
                      owner,
                      repo: repoName,
                      ref: 'refs/heads/main',
                      sha: commit.sha
              });
  }

  const repoUrl = `https://github.com/${owner}/${repoName}`;
    console.log(`Pushed ${fileEntries.length} files to ${repoUrl}`);
    return repoUrl;
}

module.exports = { createAndPush };
