# Vocabulary Update Instruction

This project is a separate reading-vocabulary deck modeled after the user's existing `french-vocab` flashcard project.

## Required Workflow

1. Add new marked words to `vocab.json`.
2. Use the user's source sentence as the example when it is readable.
3. Keep the example short: one sentence or a short sentence fragment is enough.
4. Add practical collocations that help the user reuse the word actively.
5. Classify each card with a specific `theme` and useful `tags`.
6. Run `npm run export`.
7. Run `npm run validate`.

## Card Shape

Each card must contain:

- `id`
- `date`
- `batch`
- `theme`
- `tags`
- `expression`
- `pos`
- `zh`
- `definitionFr`
- `collocations`
- `example`
- `exampleZh`
- `useCase`
- `sourcePage`

Do not add generic filler cards. If an underlined word is partly hidden or not readable, ask for a clearer page image before adding it. Do not commit source page images to this public repository.
