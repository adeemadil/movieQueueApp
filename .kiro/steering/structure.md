# Project Structure

## Directory Organization

```
.
├── .kiro/                    # Kiro AI assistant configuration
│   ├── settings/            # Configuration files
│   │   └── mcp.json        # MCP server configuration
│   └── steering/           # AI guidance documents
│       ├── product.md      # Product overview and purpose
│       ├── tech.md         # Technology stack and commands
│       └── structure.md    # This file - project organization
└── .vscode/                # VS Code configuration
    └── settings.json       # Editor settings with Kiro integration
```

## Key Directories

### `.kiro/`

Central configuration directory for Kiro AI assistant:

- **`settings/`**: Configuration files for MCP and other Kiro features
- **`steering/`**: Markdown files that guide AI behavior and provide context

### `.vscode/`

VS Code specific configuration:

- Contains editor settings optimized for Kiro integration
- **MCP configuration is ENABLED** (`kiroAgent.configureMCP: "Enabled"`)
- Allows MCP server configuration and management through Kiro interface

## File Conventions

### Steering Documents

- Use `.md` extension for all steering files
- Keep filenames descriptive and lowercase
- Structure documents with clear headings for easy parsing
- Include practical examples and specific guidance

### Configuration Files

- MCP configuration uses JSON format
- Workspace-level configs take precedence over user-level configs
- Use clear, descriptive server names in MCP configuration
