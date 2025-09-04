# Technology Stack

## Core Technologies

- **Kiro AI Assistant**: Primary development environment
- **Model Context Protocol (MCP)**: Extended AI capabilities through server integrations
- **VS Code**: Code editor with Kiro extension integration

## Configuration

- **MCP Configuration**: Located at `.kiro/settings/mcp.json` and `~/.kiro/settings/mcp.json`
- **VS Code Settings**: `.vscode/settings.json` with Kiro MCP configuration **ENABLED** (`kiroAgent.configureMCP: "Enabled"`)
- **Steering Rules**: `.kiro/steering/` directory for AI guidance documents

## MCP Status

✅ **MCP is currently ENABLED** in this workspace

- MCP servers can be configured and will be automatically loaded
- Use command palette "MCP" commands for server management
- MCP tools are available for testing and integration

## Common Commands

Since this is a Kiro-focused workspace, most operations are handled through the AI assistant interface:

### MCP Operations

- Use Kiro command palette: Search for "MCP" commands
- Test MCP tools directly through Kiro chat interface
- MCP servers auto-reconnect on configuration changes

### Development Workflow

- Interact with Kiro through chat interface
- Use `#File` or `#Folder` context in chat
- Leverage steering rules for consistent AI behavior
- Configure agent hooks for automated workflows
