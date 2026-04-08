# Genesis Loop

> **One prompt. Full app. Deployed.**

Genesis Loop is an AI orchestration agent with a chat interface. Type a simple description of what you want to build, and it automatically chains together multiple AI tools to go from idea to live deployed app — with zero manual steps.

## The Pipeline

```
Your Prompt
    |
        v
        [ChatGPT] --> Generates full project blueprint & architecture
            |
                v
                [Claude] --> Builds all code files from the blueprint
                    |
                        v
                        [GitHub] --> Creates a new repo and pushes all files
                            |
                                v
                                [Cursor] --> Opens project locally for final polish
                                    |
                                        v
                                        [Railway] --> Deploys the app live
                                        ```

                                        ## Setup

                                        ### 1. Clone and install

                                        ```bash
                                        git clone https://github.com/customerservice-prog/Genesis-Loop---mind---body---soul.git
                                        cd Genesis-Loop---mind---body---soul
                                        npm install
                                        ```

                                        ### 2. Configure environment variables

                                        ```bash
                                        cp .env.example .env
                                        ```

                                        Edit `.env` and fill in:
                                        - `OPENAI_API_KEY` - from https://platform.openai.com/api-keys
                                        - `ANTHROPIC_API_KEY` - from https://console.anthropic.com/
                                        - `GITHUB_TOKEN` - from https://github.com/settings/tokens (needs `repo` scope)
                                        - `RAILWAY_TOKEN` - from https://railway.app/account/tokens

                                        ### 3. Run locally

                                        ```bash
                                        npm run dev
                                        ```

                                        Open http://localhost:3000

                                        ### 4. Deploy to Railway

                                        Connect this repo to Railway and add your environment variables in the Railway dashboard. It will deploy automatically.

                                        ## Usage

                                        1. Open the chat interface
                                        2. Type what you want: `make me a marketing agency website`
                                        3. Watch the pipeline run in real-time
                                        4. Get links to your GitHub repo, live app, and a button to open in Cursor

                                        ## File Structure

                                        ```
                                        Genesis-Loop/
                                        ├── server.js              # Express + Socket.io server
                                        ├── package.json
                                        ├── railway.json           # Railway deployment config
                                        ├── .env.example           # Environment variable template
                                        ├── src/
                                        │   ├── orchestrator.js    # Main pipeline runner
                                        │   ├── agents/
                                        │   │   ├── chatgpt.js     # ChatGPT blueprint agent
                                        │   │   ├── claude.js      # Claude code generation agent
                                        │   │   ├── github.js      # GitHub repo creation agent
                                        │   │   └── railway.js     # Railway deployment agent
                                        │   └── utils/
                                        │       └── nameGenerator.js  # Auto repo naming
                                        └── public/
                                            ├── index.html         # Chat UI
                                                ├── style.css          # Dark mode styles
                                                    └── app.js             # Frontend logic + Socket.io client
                                                    ```

                                                    ## Tech Stack

                                                    - **Backend**: Node.js, Express, Socket.io
                                                    - **AI**: OpenAI GPT-4o, Anthropic Claude
                                                    - **Version Control**: GitHub API via Octokit
                                                    - **Deployment**: Railway
                                                    - **Frontend**: Vanilla HTML/CSS/JS with real-time Socket.io updates
