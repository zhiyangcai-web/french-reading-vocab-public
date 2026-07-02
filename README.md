# French Reading Vocabulary Flashcards

Mobile-first flashcard app for the underlined words in the user's French reading homework excerpts.

Local preview:

```bash
py -m http.server 8011
```

Then open:

```text
http://localhost:8011/
```

## Files

- `index.html`: static flashcard app.
- `vocab.json`: source vocabulary data.
- `scripts/export_active_vocabulary.js`: validates `vocab.json` and regenerates Markdown exports.
- `cards.md`: card-style study export.
- `table.md`: compact table export.
- `daily_active_vocabulary_log.md`: update log grouped by theme.

## Commands

```bash
npm run export
npm run validate
```

If `npm` is not on PATH, run the script directly:

```bash
node scripts/export_active_vocabulary.js export
node scripts/export_active_vocabulary.js validate
```

## Update Rules

Add only words or expressions the user marked for active review. Keep examples short and source-based: use the sentence around the marked word, not full-page transcription. Do not commit source page images to this public repository.
