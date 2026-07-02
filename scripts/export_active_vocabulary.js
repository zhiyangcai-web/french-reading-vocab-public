const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vocabPath = path.join(root, "vocab.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeUtf8(fileName, content) {
  fs.writeFileSync(path.join(root, fileName), content.replace(/\r?\n/g, "\n"), "utf8");
}

function escapeCell(value) {
  return String(value == null ? "" : value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();
}

function tagsText(card) {
  return Array.isArray(card.tags) ? card.tags.join(", ") : "";
}

function groupCards(cards) {
  const groups = new Map();
  for (const card of cards) {
    const key = card.theme;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(card);
  }
  return groups;
}

function buildCardsMarkdown(data) {
  const lines = [
    "# French Reading Vocabulary Cards",
    "",
    `Updated: ${data.updated}`,
    "",
    "These cards use the user's short source sentences as examples.",
    ""
  ];

  for (const entry of groupCards(data.cards)) {
    const theme = entry[0];
    const cards = entry[1];
    lines.push(`## ${theme}`, "");
    cards.forEach((card, index) => {
      lines.push(`### ${index + 1}. ${card.expression}`, "");
      lines.push(`- 中文: ${card.zh}`);
      lines.push(`- 词性: ${card.pos}`);
      lines.push(`- 法语简释: ${card.definitionFr}`);
      lines.push(`- 来源: ${card.sourcePage}`);
      lines.push(`- 标签: ${tagsText(card)}`);
      lines.push("- 搭配:");
      for (const item of card.collocations) lines.push(`  - ${item}`);
      lines.push("");
      lines.push("例句:");
      lines.push("");
      lines.push("```text");
      lines.push(card.example);
      lines.push("```");
      lines.push("");
      lines.push(`使用场景: ${card.useCase}`);
      lines.push("");
    });
  }

  return `${lines.join("\n")}\n`;
}

function buildTableMarkdown(data) {
  const lines = [
    "# French Reading Vocabulary Table",
    "",
    `Updated: ${data.updated}`,
    "",
    "| Theme | Expression | 中文 | POS | Collocations | Example | Source |",
    "|---|---|---|---|---|---|---|"
  ];

  for (const card of data.cards) {
    lines.push([
      card.theme,
      card.expression,
      card.zh,
      card.pos,
      card.collocations.join(" / "),
      card.example,
      card.sourcePage
    ].map(escapeCell).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  return `${lines.join("\n")}\n`;
}

function buildDailyLogMarkdown(data) {
  const lines = [
    "# Reading Vocabulary Log",
    "",
    `Updated: ${data.updated}`,
    "",
    "## 2026-07-02",
    "",
    `Added ${data.cards.length} cards from the user's marked French reading pages.`,
    ""
  ];

  for (const entry of groupCards(data.cards)) {
    const theme = entry[0];
    const cards = entry[1];
    lines.push(`### ${theme}`, "");
    for (const card of cards) {
      lines.push(`- \`${card.expression}\` - ${card.zh}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function exportMarkdown() {
  const data = readJson(vocabPath);
  validateData(data, false);
  writeUtf8("cards.md", buildCardsMarkdown(data));
  writeUtf8("table.md", buildTableMarkdown(data));
  writeUtf8("daily_active_vocabulary_log.md", buildDailyLogMarkdown(data));
  console.log(`Exported markdown for ${data.cards.length} cards.`);
}

function validateData(data, validateFiles) {
  if (!data || typeof data !== "object") throw new Error("vocab.json must be an object.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated || "")) throw new Error("updated must use YYYY-MM-DD.");
  if (!Array.isArray(data.cards) || data.cards.length === 0) throw new Error("cards must be a non-empty array.");

  const ids = new Set();
  const requiredFields = [
    "id",
    "date",
    "batch",
    "theme",
    "tags",
    "expression",
    "pos",
    "zh",
    "definitionFr",
    "collocations",
    "example",
    "useCase",
    "sourcePage"
  ];

  data.cards.forEach((card, index) => {
    const label = `Card ${index + 1}`;
    for (const field of requiredFields) {
      if (!(field in card)) throw new Error(`${label} is missing ${field}.`);
    }
    if (ids.has(card.id)) throw new Error(`${label} has duplicate id ${card.id}.`);
    ids.add(card.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(card.date)) throw new Error(`${label} date must use YYYY-MM-DD.`);
    for (const field of ["batch", "theme", "expression", "pos", "zh", "definitionFr", "example", "useCase", "sourcePage"]) {
      if (typeof card[field] !== "string" || !card[field].trim()) throw new Error(`${label} ${field} must be a non-empty string.`);
    }
    if (!Array.isArray(card.tags) || card.tags.length === 0) throw new Error(`${label} tags must be a non-empty array.`);
    if (!Array.isArray(card.collocations) || card.collocations.length === 0) throw new Error(`${label} collocations must be a non-empty array.`);
  });

  if (!validateFiles) return;

  const requiredFiles = [
    "index.html",
    "vocab.json",
    "cards.md",
    "table.md",
    "daily_active_vocabulary_log.md",
    "README.md",
    "VOCAB_UPDATE_INSTRUCTION.md"
  ];

  for (const fileName of requiredFiles) {
    const filePath = path.join(root, fileName);
    if (!fs.existsSync(filePath)) throw new Error(`${fileName} is missing.`);
    if (fs.statSync(filePath).size === 0) throw new Error(`${fileName} is empty.`);
  }
}

function validate() {
  const data = readJson(vocabPath);
  validateData(data, true);
  console.log(`Validated ${data.cards.length} cards.`);
}

const command = process.argv[2] || "validate";
if (command === "export") exportMarkdown();
else if (command === "validate") validate();
else throw new Error(`Unknown command: ${command}`);
