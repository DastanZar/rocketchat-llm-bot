# Rocket.Chat LLM Summarizer (GSoC 2026 Prototype)

A proof-of-concept Rocket.Chat application built to demonstrate native AI integration using the official Apps-Engine framework. 

### The Objective
This prototype was developed to validate the backend architecture for integrating external Large Language Models (LLMs) directly into Rocket.Chat workspaces, specifically targeting the GSoC 2026 AI App Integrations roadmap.

### Architecture & API Usage
This app bypasses standard webhooks and leverages core Rocket.Chat Apps-Engine accessors to maintain strict server security and native UI integration:
* **`ISlashCommand`:** Registers the `/summarize` command to intercept user input directly from the chat UI.
* **`IHttp`:** Safely routes the text payload from the Rocket.Chat server to an external LLM endpoint (e.g., OpenAI, Groq, or local Open-Source models) without exposing client-side API keys.
* **`IModify`:** Parses the LLM's JSON response and injects the formatted summary back into the specific room's context seamlessly.

### Getting Started
**Prerequisites:** * Node.js (v20 LTS recommended for the CLI)
* Rocket.Chat CLI (`npm install -g @rocket.chat/apps-cli`)

**Installation:**
1. Clone this repository.
2. Run `npm install` to grab the necessary Apps-Engine dev dependencies.
3. Run `rc-apps package` to compile the TypeScript into a deployment-ready `.zip` file.
4. Upload the generated `.zip` to your local Rocket.Chat workspace via **Administration > Workspace > Apps**.

**Configuration:**
Once installed, navigate to the App's settings in your Rocket.Chat admin panel to provide your chosen `LLM_API_KEY` and endpoint.

---
*Built by Abhinav Singh for GSoC 2026 Exploration.*
