# Quote and Word Token Patterns in Vejice

## Key Findings

### 1. **QUOTE_TRACE_REGEX and Quote Detection** 
[Line 114: preveriVejice.js](src/logic/preveriVejice.js#L114)
```javascript
const QUOTE_TRACE_REGEX = /["'\u00AB\u00BB\u2018\u2019\u201C\u201D]/u;
```
**Purpose**: Detects various quote character types:
- Straight quotes: `"` and `'`
- Double guillemets: `«` (`\u00AB`) and `»` (`\u00BB`)
- Curly quotes: `` ` `` (`\u2018`), `'` (`\u2019`), `"` (`\u201C`), `"` (`\u201D`)

### 2. **QUOTES Constant - API/Core Quote Set**
[Line 27: textUtils.js](src/logic/engine/textUtils.js#L27)
```javascript
export const QUOTES = new Set(['"', "'", "\u201C", "\u201D", "\u201E", "\u00AB", "\u00BB"]);
```
**Note**: Slightly different from QUOTE_TRACE_REGEX - includes `\u201E` („) but doesn't include backtick

### 3. **Token Boundary Regex Patterns**
[Lines 1-2: textUtils.js](src/logic/engine/textUtils.js#L1-L2)

#### TOKEN_REPEAT_LEADING_REGEX
```javascript
const TOKEN_REPEAT_LEADING_REGEX = /^[\s"'`\u201C\u201D\u201E()\u00AB\u00BB]+/gu;
```
**Purpose**: Strips leading whitespace, quotes, and brackets from token text for comparison

#### TOKEN_REPEAT_TRAILING_REGEX
```javascript
const TOKEN_REPEAT_TRAILING_REGEX = /[\s,.;:!?"'`\u201C\u201D\u201E()\u00AB\u00BB]+$/gu;
```
**Purpose**: Strips trailing whitespace, punctuation including quotes, and brackets from token text

#### Use Case:
[Lines 9-17: textUtils.js](src/logic/engine/textUtils.js#L9-L17)
```javascript
export function normalizeTokenRepeatKey(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(TOKEN_REPEAT_LEADING_REGEX, "")
    .replace(TOKEN_REPEAT_TRAILING_REGEX, "")
    .trim()
    .toLowerCase();
}
```
**Result**: `"word"` → `word` (for repeat token matching)

### 4. **TRAILING_BOUNDARY_CLOSER_REGEX - Closing Quote Detection**
[Line 35: CommaSuggestionEngine.js](src/logic/engine/CommaSuggestionEngine.js#L35)
```javascript
const TRAILING_BOUNDARY_CLOSER_REGEX = /["'\u201d\u2019\u00ab\u00bb)\]]/u;
```
**Purpose**: Identifies closing quotes and brackets (used in quote boundary detection for comma placement logic)

### 5. **Quote Boundary Classification in Suggestion Metadata**
[Lines 2916-2927: CommaSuggestionEngine.js](src/logic/engine/CommaSuggestionEngine.js#L2916-L2927)

```javascript
const quoteCharsClosing = /["'\u201D\u2019\u00AB)\]]/u;
const quoteCharsOpening = /["'\u201C\u2018\u00BB(\[]/u;

const classifyIntent = () => {
  const commaIndex = resolveCommaIndex();
  if (commaIndex < 0 || commaIndex >= correctedText.length) return "unknown";
  const leftChar = nearestNonSpaceLeft(commaIndex - 1);
  const rightChar = nearestNonSpaceRight(commaIndex + 1);
  if (quoteCharsClosing.test(rightChar)) return "before_closing_quote";
  if (quoteCharsClosing.test(leftChar)) return "after_closing_quote";
  if (quoteCharsOpening.test(rightChar)) return "before_opening_quote";
  if (quoteCharsOpening.test(leftChar)) return "after_opening_quote";
  return "none";
};
```
**Purpose**: Classifies comma position relative to quote boundaries

### 6. **Quote-Boundary Token Detection & Word Adjacent Selection**
[Lines 2933-2943: CommaSuggestionEngine.js](src/logic/engine/CommaSuggestionEngine.js#L2933-L2943)

```javascript
const isQuoteBoundaryToken = (value) =>
  typeof value === "string" && /^[\s"'`\u00AB\u00BB\u2018\u2019\u201C\u201D\u201E()\[\]]+$/u.test(value);

let highlightAnchor =
  sourceAround.at ??
  sourceAround.before ??
  sourceAround.after ??
  targetAround.at ??
  targetAround.before ??
  targetAround.after;

if (isQuoteBoundaryToken(highlightAnchor?.tokenText)) {
  const adjacentWordAnchor =
    [
      sourceAround.before,
      targetAround.before,
      sourceAround.after,
      targetAround.after,
    ].find((anchor) => /[\p{L}\p{N}]/u.test(anchor?.tokenText || "")) || null;
  if (adjacentWordAnchor) {
    highlightAnchor = adjacentWordAnchor;
  }
}
```

**KEY FINDING**: When the token found at a comma position is purely quote/punctuation characters, the code looks for an adjacent word token (before or after) to use as the highlight anchor instead.

### 7. **Suggestion Quote Boundary Touching Detection**
[Lines 132-148: preveriVejice.js](src/logic/preveriVejice.js#L132-L148)

```javascript
function suggestionTouchesQuoteBoundary(suggestion) {
  if (!suggestion || typeof suggestion !== "object") return false;
  const meta = suggestion?.meta?.anchor || {};
  const snippetLeft = suggestion?.snippets?.leftSnippet;
  const snippetRight = suggestion?.snippets?.rightSnippet;
  const candidates = [
    snippetLeft,
    snippetRight,
    meta?.highlightText,
    meta?.sourceTokenBefore?.tokenText,
    meta?.sourceTokenAt?.tokenText,
    meta?.sourceTokenAfter?.tokenText,
    meta?.targetTokenBefore?.tokenText,
    meta?.targetTokenAt?.tokenText,
    meta?.targetTokenAfter?.tokenText,
  ];
  return candidates.some((value) => hasQuoteTraceChar(value));
}
```

**Purpose**: Checks if a suggestion's context (surrounding tokens, snippets, or highlight text) contains quote characters

### 8. **Tokenization for Anchoring**
[Lines 357-407: SyntheticAnchorProvider.js](src/logic/anchoring/SyntheticAnchorProvider.js#L357-L407)

```javascript
export function tokenizeForAnchoring(text = "", prefix = "syn") {
  if (typeof text !== "string" || !text.length) return [];
  const tokens = [];
  const isWordChar = (char) => /[\p{L}\p{N}]/u.test(char || "");
  const isInnerWordJoiner = (char) => /['\u2019`-]/u.test(char || "");
  let idx = 1;
  let cursor = 0;
  while (cursor < text.length) {
    while (cursor < text.length && /\s/u.test(text[cursor])) cursor++;
    if (cursor >= text.length) break;
    const start = cursor;
    let end = cursor + 1;
    const first = text[start];
    if (isWordChar(first)) {
      while (end < text.length) {
        const next = text[end];
        if (isWordChar(next)) {
          end++;
          continue;
        }
        if (
          isInnerWordJoiner(next) &&
          end + 1 < text.length &&
          isWordChar(text[end + 1])
        ) {
          end++;
          continue;
        }
        break;
      }
    } else if (first === "." && text.slice(start, start + 3) === "...") {
      end = start + 3;
    }
    const tokenText = text.slice(start, end);
    tokens.push({
      token_id: `${prefix}${idx++}`,
      token: tokenText,
      start_char: start,
      end_char: end,
    });
    cursor = end;
  }
  return tokens;
}
```

**Purpose**: Simple synthetic tokenizer that:
- Skips whitespace
- Groups word characters (letters/digits) together
- Allows inner word joiners (`'`, `` ` ``, `-`) if surrounded by word characters
- Handles ellipsis (`...`)
- **Does NOT include quotes with words** - quotes break tokens

### 9. **Token Text Extraction from Anchors**
[Lines 141-149: SyntheticAnchorProvider.js](src/logic/anchoring/SyntheticAnchorProvider.js#L141-L149)

```javascript
export function normalizeToken(rawToken, prefix, index) {
  // ... extraction logic for various token formats ...
  const textCandidate =
    rawToken.token ??
    rawToken.text ??
    rawToken.form ??
    rawToken.value ??
    rawToken.surface ??
    rawToken.word;
  const trailing =
    rawToken.whitespace ??
    rawToken.trailing_ws ??
    rawToken.trailingWhitespace ??
    rawToken.after ??
    rawToken.space ??
    "";
  // ...
}
```

**Purpose**: Normalizes API token responses which may have quotes attached to the `text`/`word` field

### 10. **API Response Token Processing**
[Lines 664-688: CommaSuggestionEngine.js](src/logic/engine/CommaSuggestionEngine.js#L664-L688)

When API returns detailed results:
```javascript
const { tokens: rekeyedSource, map: sourceMap } = rekeyTokensWithMap(
  meta.detail.sourceTokens,
  `${basePrefix}s`
);
sourceTokens.push(...rekeyedSource);
const { tokens: rekeyedTarget } = rekeyTokensWithMap(meta.detail.targetTokens, `${basePrefix}t`);
targetTokens.push(...rekeyedTarget);
```

**Key Point**: The API returns `sourceTokens` and `targetTokens` which may have quotes attached to the token text field

## Pattern Summary: Where Quotes End Up Grouped with Words

1. **From API**: The API endpoint (`popraviPovedDetailed`) returns tokens where the token text field may include quotes as part of the word
   - Example: API token might be `"Hello"` or `"Hello`, not just `Hello`

2. **Token Strip Process**: The `normalizeTokenRepeatKey()` function uses regexes to strip quotes for repeat token matching:
   - Leading quotes removed by: `TOKEN_REPEAT_LEADING_REGEX`
   - Trailing quotes removed by: `TOKEN_REPEAT_TRAILING_REGEX`

3. **Token Anchor Mapping**: `mapTokensToParagraphText()` matches these quote-containing tokens against paragraph text

4. **Suggestion Context**: When building suggestions, the code detects if a token is purely a quote boundary and tries to find an adjacent word token instead

5. **Quote Boundary Inference**: The `classifyIntent()` function in suggestion metadata looks at characters around comma positions to understand quote contexts

## Regex Patterns Reference

| Regex | Location | Purpose | Includes Quotes |
|-------|----------|---------|-----------------|
| `QUOTE_TRACE_REGEX` | preveriVejice.js:114 | Quote detection for tracing | Yes, 7 types |
| `QUOTES` (Set) | textUtils.js:27 | Core quote set | Yes, 7 types |
| `TOKEN_REPEAT_LEADING_REGEX` | textUtils.js:1 | Strip leading quotes from tokens | Yes |
| `TOKEN_REPEAT_TRAILING_REGEX` | textUtils.js:2 | Strip trailing quotes from tokens | Yes |
| `TRAILING_BOUNDARY_CLOSER_REGEX` | CommaSuggestionEngine.js:35 | Closing quote detection | Yes, 5 types |
| `isQuoteBoundaryToken` pattern | CommaSuggestionEngine.js:2933 | Check if token is only quotes/punctuation | Yes |
| Tokenizer word char | SyntheticAnchorProvider.js:361 | `[\p{L}\p{N}]` - letters and digits only | No |

## Related Quote Intent Classification

[Lines 2916-2927: CommaSuggestionEngine.js](src/logic/engine/CommaSuggestionEngine.js#L2916-L2927)

The `explicitQuoteIntent` field can be:
- `"before_closing_quote"` - comma should go before closing quote
- `"after_closing_quote"` - comma should go after closing quote  
- `"before_opening_quote"` - comma should go before opening quote
- `"after_opening_quote"` - comma should go after opening quote
- `"none"` - no quote context
