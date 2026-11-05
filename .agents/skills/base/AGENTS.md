# Agents Instructions

- **{Root_Folder}**: {Root folder for the project and agents.}
- **{Agents_Folder}**: {Folder for agent-related files.}
- **{Agents_file}**: {Main instructions file for agents.}
- **{Project_Folder}**: {Folder for project-related files.}

## Product Overview

{Product name} is a {short description of product}.

- {Additional key features or characteristics of the product.}
  
## Technical Implementation

### Tech Stack

- **Language**: {language and version}
- **Framework**: {framework and version}
- **Database**: {database}
- **Security**: {security strategy}
- **Testing**: {testing framework }
- **Logging**: {logging tool }

### Development workflow

```bash
# Set up the project
{}
# Build/Compile the project
{}
# Run the project
{}
# Test the project
{}
# Deploy the project
```

### Folder structure
```text
.                         # Project root  
├── {Agents_file}         # This file with instructions for AI agents
├── {Agents_Folder}/      # Agents related files (skills, specs, etc)
│   ├── agents/           # Specific agent definitions
|   ├── prompts/          # Reusable prompts directory
|   └── skills/           # Custom agent skills
├── {Project_Folder}/     # Project related files (specs, plans, etc)
|   └── specs/            # Specifications and plans
├── CHANGELOG.md          # Project history and updates
├── README.md             # Human friendly project overview
├── src/                  # Source code folder
├── tests/                # Test files
└── other_files/          # Other relevant files and folders 
```

## Environment
- **OS dev**: `Windows` | `Linux` | `MacOS`
- **Terminal**: ` cmd` | `PowerShell` | `bash` | `zsh`
- **Git remote**: {git remote URL}
- **Default branch**: `main` | `master` 

## Behavior Guidelines

- Code and documentation must be in English.
- Chat responses must be in the language of the user prompt.
- Sacrifice grammar for conciseness when needed to fit response limits.
- When using templates, ensure to replace {placeholders} with actual values.

### Naming Conventions

Use slugs with hyphens for any identifiers or non code file names.

Prefix specifications, branches, and commit messages with the following tags:

- `feat` : For new features or significant changes.
- `fix` : For bug fixes or minor improvements.
- `chore` : For routine tasks, maintenance, or non-functional changes.
