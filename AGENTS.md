# Kansas City Symphony Mobile Music Box Events API

This project provides a serverless API endpoint that scrapes the Kansas City Symphony website for upcoming "Mobile Music Box" concert events. It extracts event details, including date, time, location, and other notes, and returns them as a JSON array.

The primary goal of this project is to provide a structured, machine-readable format for the event schedule, which is otherwise only available as human-readable text on the KC Symphony's website.

## Setup

### Code Intelligence

Prefer LSP over Grep/Read for code navigation — it's faster, precise, and avoids reading entire files:

- `workspaceSymbol` to find where something is defined
- `findReferences` to see all usages across the codebase
- `goToDefinition` / `goToImplementation` to jump to source
- `hover` for type info without reading the file

Use Grep only when LSP isn't available or for text/pattern searches (comments, strings, config).

After writing or editing code, check LSP diagnostics and fix errors before proceeding.

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: <agent model name> <agent model email>
```

## Coding Standards

- Follow existing conventions — check neighboring files
- Only use libraries already in the codebase
- Never expose secrets or keys
- When modifying files, cover all occurrences
