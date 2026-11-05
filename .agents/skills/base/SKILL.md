---
name: base
description: Creates the base foundation for the agent's workflow. This prompt is used to set up the initial context and instructions for the agent.
user-invocable: true
disable-model-invocation: true
---

# Base Skill

## Role

Act as a software developer.

## Task

Define project paths and context for the agent's workflow. 
Generate or update the main agents instructions file.
Generate or update the project briefing document.

## Context

- The [Blueprint for Agents](./blueprint.md) with core paths and folders.
- The [Agents Instructions template](./AGENTS.template.md) for the main instructions file.

## Steps to follow:

### Step 1: Define paths and folders

- [ ] Ask the user to confirm or set the following paths:
  - {Root_Folder} : The root folder for the project and agents.
  - {Agents_Folder} : The folder where agent-related files will be stored.
  - {Project_Folder}: The folder where project-related files will be stored.
  - {Agents_file}: The main instructions file for agents.

### Step 2: Generate or update the AGENTS.md file
- [ ] Review the existing `{Agents_file}` if it exists.
- [ ] Create or update the `{Agents_file}` with:
  - A brief overview of the project and its goals.
  - Instructions for agents on how to use the provided context and documentation.
  - Guidelines for communication, behavior, and collaboration among agents.
  - Keep it under 100 sentences, with each sentence less than 100 characters.

### Step 3: Generate or update the briefing document
- [ ] Create or update the briefing document at `{Project_Folder}/briefing.md` with:
  - A summary of the project, its objectives, and key information.
  - Sacrifice grammatical correctness for brevity and clarity.
  - Keep it under 25 sentences, with each sentence less than 80 characters.

## Output checklist

- [ ] The {Root_Folder} ,{Agents_Folder} and {Project_Folder} are set.
- [ ] The {Agents_file} path is defined and points to the correct location.
- [ ] The `{Agents_file}` is created or updated.
- [ ] The briefing document at `{Project_Folder}/briefing.md` is up to date.
- [ ] The project structure and requirements are clearly defined.