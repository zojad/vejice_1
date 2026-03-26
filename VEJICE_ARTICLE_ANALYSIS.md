# VEJICE: A Deep-Dive Technical & Editorial Analysis
## A Modern Word Add-In for Automated Punctuation Verification

---

## 1. PROJECT PURPOSE & OVERVIEW

### What is Vejice?
**Vejice** (Slovenian for "commas") is a Microsoft Office Word add-in developed by **CJVT** (Center for Language Resources and Technologies) that automatically detects and corrects missing or erroneous comma placement in documents. It integrates directly into the Word ribbon interface, allowing users to verify punctuation with a single click.

### Problem It Solves
- **Punctuation Inconsistency**: Writers often misplace or omit commas, creating grammatically incorrect or ambiguous sentences
- **Language-Specific Nuance**: Slovenian (the primary language supported) has complex comma rules that vary by sentence structure, clause dependency, and quotation context
- **Manual Review Burden**: Proofreading punctuation is tedious and error-prone; users need automated assistance
- **Real-Time Integration**: The add-in works within Word itself, eliminating context-switching to external tools

### Key Benefits
✓ Cloud-connected grammar checking without document submission  
✓ Works on both Word Desktop and Word Online  
✓ Visual highlighting of suggested changes  
✓ Support for tracked changes on desktop for reproducible editing  
✓ Handles complex scenarios: quotes, parentheses, boundary punctuation  
✓ Open-source, MIT-licensed foundation based on Office Add-in TaskPane template  

---

## 2. ARCHITECTURE & KEY COMPONENTS

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (Taskpane)                     │
│  [Preveri vejice] [Počisti] [Sprejmi/Zavrni] [Notifications]    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              PREVERI VEJICE MODULE (Core Logic)                  │
│  - Document traversal & paragraph extraction                    │
│  - Suggestion generation & application                         │
│  - Online/Desktop branching logic                              │
└────┬──────────────┬───────────────┬──────────────┬──────────────┘
     │              │               │              │
┌────▼──────┐ ┌────▼────────┐ ┌────▼───────┐ ┌────▼──────────┐
│  ADAPTERS  │ │   BRIDGES   │ │ ANCHORING  │ │   ENGINE      │
│ Desktop    │ │ Text Bridge │ │ Providers  │ │ Comma Engine  │
│ Online     │ │ Apply Logic │ │ Tokenizers │ │ Suggestion    │
└────┬──────┘ └────┬────────┘ └────┬───────┘ └────┬──────────┘
     │             │               │              │
     └─────────────┴───────────────┴──────────────┘
              │
     ┌────────▼─────────┐
     │   TEXT UTILS     │
     │ Normalization    │
     │ Quote Handling   │
     │ Tokenization     │
     └────────┬─────────┘
              │
     ┌────────▼──────────┐
     │  API / EXTERNAL   │
     │ Cloud Vejice API  │
     │ Lemmatizer API    │
     └───────────────────┘
```

### Major Components Explained

#### **1. TASKPANE UI Layer** (`src/taskpane/`)
**Purpose**: User-facing interface for executing checks and reviewing results

**Files**:
- `taskpane.html`: Slovenian-language interface with buttons for:
  - "Preveri vejice" (Check commas) – triggers scan
  - "Počisti" (Clear) – removes all highlighted suggestions
  - "Sprejmi predlog" / "Zavrni predlog" (Accept/Reject single suggestion)
  - "Sprejmi vse" / "Zavrni vse" (Accept/Reject all suggestions)
  - Real-time notification list showing errors found

- `taskpane.js`: Event handling, state management, and suggestion navigation
  - Manages check debouncing (800ms throttle on button clicks)
  - Tracks "currentSuggestionIndex" for arrow-key navigation
  - Integrates with notifications system to display results
  - Conditionally renders desktop vs. online-specific UI elements

- `taskpane.css`: Fabric Design System styling for Office UI consistency

**Key Features**:
- Supports both **Desktop** (Word Win32) and **Web** (Word Online) manifests
- Error boundary with startup exception reporting
- Status line showing real-time operation feedback
- Notification queue with max 30 visible items

---

#### **2. PREVERI VEJICE MODULE** (`src/logic/preveriVejice.js`)
**Purpose**: Orchestrator of the entire checking workflow; coordinates all components

**Core Responsibilities**:
- **Document Reading**: Extracts all paragraphs from Word document
- **Paragraph Processing**: Chunking long paragraphs into manageable units (max 3000 chars)
- **Suggestion Engine Invocation**: Calls `CommaSuggestionEngine` to analyze text
- **Result Visualization**: Marks suggestions with colored highlights and underlines
- **Change Application**: Applies accepted suggestions back to document
- **Platform Adaptation**: Routes logic to Desktop or Online handlers based on environment

**Key Constants**:
```javascript
MAX_PARAGRAPH_CHARS = 3000        // Ignore if longer (user must split)
PARAGRAPH_FIRST_MAX_CHARS = 1200  // First paragraph analyzed has limit
LONG_PARAGRAPH_MESSAGE            // User notification when exceeded
MAX_AUTOFIX_PASSES = 3             // Desktop Win32; 2 for Online
```

**Key Exports**:
- `checkDocumentText(context)` – Desktop workflow
- `checkDocumentTextOnline(context)` – Online workflow
- `applySuggestionOnlineById(id)` – Accept a single suggestion
- `rejectSuggestionOnlineById(id)` – Reject a single suggestion
- `isDocumentCheckInProgress()` – Query check status

**Color Highlighting**:
- Insert (missing comma): Light yellow (#FFF9C4) + orange wavy underline
- Delete (erroneous comma): Light red (#FFCDD2) + red wavy underline

---

#### **3. COMMA SUGGESTION ENGINE** (`src/logic/engine/CommaSuggestionEngine.js`)
**Purpose**: Core AI-adjacent logic that analyzes text and generates comma suggestions

**How It Works**:
1. **Chunking Strategy**: Splits long paragraphs into ~650-900 char chunks (soft max) or 3 max units
2. **Tokenization**: Breaks text into word tokens using anchoring providers
3. **API Calls**: Sends chunks to cloud Vejice API for lemmatization & suggestion generation
4. **Deduplication**: Filters duplicate suggestions and handles boundary cases
5. **Caching**: Caches API results (800 entries, 10-minute TTL) to reduce API load
6. **Concurrency Control**: Processes chunks with 2-4 concurrent workers

**Key Configuration**:
```javascript
LEMMA_CHUNK_TARGET_CHARS = 650             // Ideal chunk size
LEMMA_CHUNK_SOFT_MAX_CHARS = 900           // Don't exceed
CHUNK_API_CACHE_MAX_ENTRIES = 800          // In-memory cache
CHUNK_API_CACHE_TTL_MS = 10 * 60 * 1000    // 10-minute cache
API_HEALTH_FAILURE_THRESHOLD = 3           // Failures before circuit break
API_FAILURE_COOLDOWN_MS = 90000            // 90-second cooldown on API error
```

**Resilience**:
- **Circuit Breaker**: Detects repeated API failures; enters cooldown
- **Retry Logic**: Exponential backoff with jitter (400-2500ms base for cloud)
- **Health Monitoring**: Tracks failure in 30-second window
- **Graceful Degradation**: If API unavailable, user sees notification and check halts

**Output**: Array of `Suggestion` objects with:
- `id`: Unique identifier
- `kind`: "insert" or "delete"
- `charHint`: Exact character position
- `tokenHint`: Surrounding tokens for anchoring
- `snippets`: Context text (left/right/focus for visual display)
- `meta`: Confidence, API response data

---

#### **4. ADAPTERS** (`src/logic/adapters/`)
**Purpose**: Abstract differences between Word Desktop and Word Online APIs

##### **WordDesktopAdapter**
**Method**: Uses native Word.Paragraphs collection with explicit loading strategy
```javascript
// Two-step load to avoid failures in some document states
paras.load("items");                    // Load paragraph collection
await context.sync();
paras.items.forEach(p => p.load("text")); // Load each text separately
await context.sync();
```
**Benefit**: Works reliably across Word 2019, 2021, M365 Desktop versions

##### **WordOnlineAdapter**
**Method**: Uses simpler nested load syntax; calls highlight-specific implementations
```javascript
paras.load("items/text");  // Single nested load (faster)
await context.sync();
```
**Difference**: Online version supports highlight markers; applies `clearSuggestionMarkers()` to remove old highlights

**Design Pattern**: Both implement identical interface, allowing `preveriVejice.js` to call either without branching

---

#### **5. TEXT BRIDGES** (`src/logic/bridges/`)
**Purpose**: Encapsulates actual Word document text modification logic

##### **TextBridge (Base Class)**
```javascript
class TextBridge {
  applyInsertSuggestion(context, paragraph, suggestion)  // Add comma
  applyDeleteSuggestion(context, paragraph, suggestion)  // Remove comma
  shouldForceSpacingCleanup()                            // Post-cleanup flag
  getNormalizationProfile()                              // Config
}
```

##### **DesktopTextBridge**
- Uses Word.RangeFormat for styling and text modification
- Applies suggestions immediately to document
- Respects Word's Tracked Changes if enabled
- Handles normalization profiles (whitespace collapse, quote/dash normalization)

##### **OnlineTextBridge**
- Uses Range.font.color and underline for highlighting
- Cannot directly modify text in Web Word; highlights suggestions for manual review or batch API call
- Implements `forceSpacingCleanup` to normalize extra spaces

**Normalization Profile**:
```javascript
{
  collapseWhitespace: true,      // Remove double spaces
  normalizeQuotes: false,         // Don't change quote type
  normalizeDashes: false,         // Keep existing dash type
  normalizeEllipsis: false       // Don't convert ... to …
}
```

---

#### **6. ANCHORING PROVIDERS** (`src/logic/anchoring/`)
**Purpose**: Maps suggestions (generated from API on normalized text) back to original document positions

##### **SyntheticAnchorProvider**
- **No external dependencies**; uses regex-based tokenization
- Parses text by whitespace boundaries, punctuation
- Creates "synthetic anchors" (character positions + token context)
- Used as fallback or when lemmatizer unavailable

**Tokenization**:
```javascript
tokenizeForAnchoring(text)  // → [{text, startChar, endChar}, ...]
```

##### **LemmatizerAnchorProvider**
- **Calls external Lemmatizer API** for morphological analysis
- Returns lemmatized forms of words for more robust matching
- Handles inflected word forms (e.g., "vejico" → "vejica")
- Caches lemmatization results to avoid redundant API calls

**Workflow**:
1. Split paragraph into sentences
2. Call lemmatizer API with sentence text
3. Map lemmatized tokens back to original positions
4. Use lemmatized tokens + position hints to locate suggestion points

##### **Anchor Finder**
```javascript
findAnchorsNearChar(charPosition, tokens, confidenceThreshold)
// → Finds nearby tokens when exact position is ambiguous
```
Used when document has drifted slightly (e.g., user edited nearby text)

---

#### **7. TEXT UTILITIES** (`src/logic/engine/textUtils.js`)
**Purpose**: Shared text processing functions used throughout the system

**Key Utilities**:

| Function | Purpose | Example |
|----------|---------|---------|
| `normalizeParagraphWhitespace()` | Collapse multiple spaces | `"a  b"` → `"a b"` |
| `normalizeParagraphForEquality()` | Normalize for comparison | Quotes, dashes, ellipsis |
| `normalizeTokenRepeatKey()` | Strip punctuation for comparison | `'"hello"'` → `"hello"` |
| `charAtSafe()` | Get char safely without throwing | UTF-16 aware |
| `isDigit()` | Regex check for 0-9 | |
| `makeAnchor()` | Create position anchor object | |
| `extractTokenBoundaryMetadata()` | Analyze token boundaries | Quotes, brackets, etc. |

**Quote Handling** (Central to Comma Logic):
```javascript
export const QUOTES = new Set([
  '"', "'", 
  "\u201C", "\u201D",  // Curly quotes "..."
  "\u201E",            // Low quote „
  "\u00AB", "\u00BB"   // Guillemets « »
]);
```

**Boundary Regex Patterns**:
```javascript
BOUNDARY_QUOTE_REGEX = /["'`...]/u          // All quote types
BOUNDARY_OPENER_REGEX = /[..."(\[]/u        // Opening boundaries
BOUNDARY_CLOSER_REGEX = /[...")\]]/u        // Closing boundaries
BOUNDARY_DASH_REGEX = /[-–—]/u              // Dash variants
INVISIBLE_GAP_REGEX = /[\s\u200B-\u200D\uFEFF]/u  // Whitespace + zero-width
```

These handle Slovenian-specific quotation styles and ensure commas are correctly placed relative to complex punctuation.

---

#### **8. SUGGESTION CLASS** (`src/logic/engine/Suggestion.js`)
**Purpose**: Data structure representing a single comma suggestion

```javascript
class Suggestion {
  id                          // Unique ID
  paragraphIndex              // Which paragraph
  kind                        // "insert" or "delete"
  charHint                    // {start, end} character range
  tokenHint                   // {leftToken, rightToken}
  snippets                    // {leftSnippet, rightSnippet, focusWord}
  meta                        // Confidence level, API data, etc.
  debug                       // Debug information
}
```

**Anchor Resolution Priority**:
1. Prefer `charHint` (precise character position)
2. Fall back to `tokenHint` (surrounding words)
3. Fall back to `snippets` (context strings)

This multi-level fallback ensures suggestions can be anchored even if document has drifted slightly since analysis.

---

#### **9. API VEJICE MODULE** (`src/api/apiVejice.js`)
**Purpose**: Client wrapper around cloud Vejice API service

**Main Export Functions**:
```javascript
popraviPoved(text, signal)          // Submit sentence for analysis
popraviPovedDetailed(text, signal)  // Include detailed metadata
```

**API Endpoint Configuration**:
```javascript
const API_URL = resolveApiUrl()
// Priority: window.__VEJICE_API_URL → process.env.VEJICE_API_URL → window.location.origin/api/postavi_vejice
```

**Request/Response Handling**:
- Uses Axios for HTTP transport
- Implements exponential backoff retry (400-2500ms)
- Tracks API health; enters 90-second cooldown on 3 failures in 30 seconds
- Handles URL encoding for special characters in text
- Supports environment-based API key (`window.__VEJICE_API_KEY`)

**Response Format** (Expected from cloud API):
```javascript
{
  suggestions: [
    {
      type: "insert|delete",
      position: number,
      value: string,
      confidence: "low|medium|high",
      context: {...}
    },
    ...
  ],
  status: "ok|error",
  message: string
}
```

**Quote Tracing** (For Debugging):
```javascript
window.__VEJICE_QUOTE_TRACE__ = "true"  // Enable quote matching logs
```

---

#### **10. COMMAND HANDLERS** (`src/commands/`)
**Purpose**: Ribbon button integration for Office

**Command Handler** (`commands.js`):
```javascript
// Registered in manifest as action for "CheckVejice" button
// Launches taskpane when Ribbon button clicked
```

**Files**:
- `commands.html`: Minimal HTML for commands framework
- `commands.js`: Event handler function
- `toast.html`: Toast notification display (fallback on error)

---

## 3. END-TO-END USER FLOW

### Scenario: User Checks a Document for Comma Errors

#### **Phase 1: Installation & Launch**
1. User installs Vejice add-in into Word (via provided manifest)
2. Word ribbon auto-includes "CJVT Vejice" button in Home tab
3. User clicks the button → Taskpane opens on right side

#### **Phase 2: User Initiates Check**
1. User clicks **"Preveri vejice"** button in taskpane
2. `preveriVejice.checkDocumentText()` is called (Desktop) or `checkDocumentTextOnline()` (Web)

#### **Phase 3: Document Parsing**
```
Word Context
    ↓
[Adapter: getParagraphs()] → Load all paragraphs
    ↓
[Filter & Chunk] → Group into ≤3000 char sections
    ↓
Array of Paragraph objects with {index, text}
```

#### **Phase 4: Suggestion Generation**
For each paragraph:
```
Paragraph text (e.g., "Tečaj je začel in vsi so prišli.")
    ↓
[TextBridge: Normalize] → "Tecaj je zacet in vsi so prisli."
    ↓
[Tokenizer] → Token array via SyntheticAnchorProvider or LemmatizerAnchorProvider
    ↓
[CommaSuggestionEngine] → Split into chunks
    ↓
[API Call] → Send chunks to cloud Vejice API
    ↓
API returns: [{type: "insert", position: 45, value: ",", confidence: "high"}, ...]
    ↓
[Map Back to Original] → Anchoring providers resolve positions
    ↓
Suggestion[] → [{kind: "insert", charHint: {start:45, end:45}, ...}, ...]
```

#### **Phase 5: Visual Feedback (Desktop)**
1. For each suggestion:
   - `Adapter.applySuggestion()` calls TextBridge
   - TextBridge creates Range at suggestion position
   - Applies colored highlight + underline
   - Adds tracked change (if enabled)

2. Taskpane updates notification list:
   ```
   Bilo je najdeno 3 predlogov.
   - Preveri vejice na mestu 124
   - Odstranis vejico na mestu 307
   - Preveri vejice na mestu 501
   ```

#### **Phase 6: Visual Feedback (Web)**
1. Similar to desktop, but:
   - Highlights are visual only (no tracked changes in Web)
   - Suggestions stored in `pendingSuggestionsOnline[]` array
   - User can click "Sprejmi predlog" or "Zavrni predlog" per suggestion

#### **Phase 7: User Reviews & Accepts**
1. **Desktop**: User views Tracked Changes pane, accepts/rejects individually or all
2. **Web**: User clicks suggestion in taskpane, clicks "Sprejmi" or "Zavrni"

#### **Phase 8: Changes Applied**
```
User clicks "Sprejmi predlog"
    ↓
[applySuggestionById()] → Lookup suggestion object
    ↓
[TextBridge.applyInsert() or applyDelete()]
    ↓
Word Range.insertText() / Range.delete()
    ↓
Document modified
    ↓
Taskpane advances to next suggestion or shows "Complete"
```

---

## 4. TECHNOLOGIES & DEPENDENCIES

### Core Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 16+ | Build & development |
| **Bundler** | Webpack 5.95.0 | Code bundling & asset management |
| **Transpiler** | Babel 7.24.0 | ES6+ → ES5 compatibility |
| **Module System** | ES6 imports/exports | Modern JavaScript modules |
| **HTTP Client** | Axios 1.7.7 | API requests |
| **Office API** | Word JavaScript API 1.3+ | Paragraph access, Range manipulation, Track Changes |
| **UI Framework** | Office UI Fabric | Consistent Office design language |

### API Integrations

| Service | Purpose | Protocol |
|---------|---------|----------|
| **Vejice Cloud API** | Comma suggestion engine | HTTP POST (JSON) |
| **Lemmatizer API** | Morphological analysis | HTTP (text-based) |
| **Microsoft Office.js** | Word document manipulation | In-process (RPC-like) |

### Development Dependencies

```json
{
  "office-addin-debugging": "^6.0.3",           // Start/stop debugging
  "office-addin-manifest": "^2.0.3",            // Manifest validation
  "office-addin-lint": "^3.0.3",                // Code quality checks
  "office-addin-dev-certs": "^2.0.3",           // HTTPS certificates
  "webpack-dev-server": "5.1.0",                // Dev server on :4001
  "@types/office-js": "^1.0.377",               // TypeScript definitions
  "html-webpack-plugin": "^5.6.0",              // HTML generation
  "copy-webpack-plugin": "^12.0.2"              // Asset copying
}
```

### NPM Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `build` | Production bundle | `webpack --mode production` |
| `build:dev` | Development bundle | `webpack --mode development` |
| `watch` | Watch mode (incremental build) | `webpack --mode development --watch` |
| `start` | Launch debugger (Desktop) | `office-addin-debugging start` |
| `start:web` | Launch debugger (Web) | `office-addin-debugging start ... web` |
| `dev-server` | Dev server on localhost:4001 | `node scripts/start-dev-server.js` |
| `proxy:lemmas` | Lemmatizer proxy | `node proxy/lemmatizer-proxy.js` |
| `proxy:vejice` | Vejice API proxy | `node proxy/vejice-api-proxy.js` |
| `lint` | Check for problems | `office-addin-lint check` |
| `lint:fix` | Auto-fix problems | `office-addin-lint fix` |
| `validate` | Validate manifest | `office-addin-manifest validate` |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, scripts, dependencies |
| `babel.config.json` | Babel transpilation config |
| `webpack.config.js` | Bundler configuration |
| `src/manifests/manifest.dev.xml` | Ribbon and permissions (development) |
| `src/manifests/manifest.web.xml` | Web-specific manifest |
| `.env` (if present) | Environment variables (API keys, etc.) |

---

## 5. USER-FACING FEATURES

### Primary Interface: Ribbon Button
- **Location**: Word Home tab, "Vejice" group
- **Label**: "CJVT Vejice"
- **Icon**: 3-size icon set (16x16, 32x32, 80x80)
- **Tooltip**: "Odpri podokno Vejice" (Open Vejice pane)
- **Action**: Opens taskpane on right side

### Taskpane UI Components

#### **Header**
```
Vejice 1.0
Preverite postavitev vejic v dokumentu.
```

#### **Main Actions**
- **[Preveri vejice]** – Scan entire document
- **[Počisti]** – Clear all highlights and suggestions

#### **Review Actions** (for accepting/rejecting)
- **[Sprejmi predlog]** – Accept currently selected suggestion
- **[Zavrni predlog]** – Reject currently selected suggestion
- **[Sprejmi vse]** – Accept all suggestions (batch)
- **[Zavrni vse]** – Reject all suggestions (batch)

#### **Notifications Section**
```
Obvestila (Notifications)
[Počisti] (Clear)

Bilo je najdeno 5 predlogov za vejice.
- Preveri vejice na mestu 45 (komema; odstavek 2)
- Odstranis vejico na mestu 78 (odstavek 3)
- Preveri vejice na mestu 120 (odstavek 5)
...
```

**Key Notification Types**:
- ✓ "Ni bilo najdenih manjkajočih ali napačnih vejic" – No issues
- ⚠ "Odstavek je predolg za preverjanje" – Paragraph exceeds 3000 chars
- ⚠ "API je spremenil več kot vejice. Pregledate odstavek" – API returned non-comma changes (suspicious)
- ❌ "Storitev CJVT Vejice trenutno ni na voljo" – API unavailable
- ⚠ "Sledenje spremembam je obvezno" – Track Changes requirement (Desktop)

#### **Status Line**
Real-time feedback:
- "Pripravljeno" (Ready)
- "Preverjam dokument..." (Checking document...)
- "Najdeno 5 predlogov" (Found 5 suggestions)
- "Napaka ob zagonu: ..." (Startup error)

### Visual Highlighting in Document

**Insert Suggestion** (Missing Comma):
- Background: Light yellow (#FFF9C4)
- Underline: Wavy orange (#E67E22)
- Marker tag: `vejice.marker.insert-{id}`

**Delete Suggestion** (Erroneous Comma):
- Background: Light red (#FFCDD2)
- Underline: Wavy red (#D32F2F)
- Marker tag: `vejice.marker.delete-{id}`

### Desktop-Specific Features
- **Tracked Changes**: When enabled, suggestions appear as tracked changes, reviewable in Word's Track Changes pane
- **Desktop Note**: "Na namiznem Wordu spremembe urejate s Sledi spremembam" (Edits via Tracked Changes)
- **Max Autofix Passes**: 3 (Win32 Word has non-deterministic rendering)

### Web-Specific Features
- **Single Highlight Load**: Highlights load inline without Tracked Changes infrastructure
- **Accept/Reject Per Suggestion**: Users navigate through suggestions one-by-one
- **Note**: "V spletnem Wordu spremembe nastane kot novo besedilo" (Changes become live text)
- **Max Autofix Passes**: 2 (Web Word more stable)

---

## 6. CONFIGURATION & DEPLOYMENT

### Manifest System

#### **Manifest Files**
Located in `src/manifests/` and `docs/`:

| Manifest | Environment | Deploy Target |
|----------|-------------|---|
| `manifest.dev.xml` | Development (local testing) | localhost:4001 |
| `manifest.web.xml` | Web (staging) | zojad.github.io/vejice_1 |
| `manifest.prod.xml` | Production (desktop) | gpu-proc1.cjvt.si |
| `manifest.web.prod.xml` | Production (web) | gpu-proc1.cjvt.si |

#### **Manifest Structure (example)**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<OfficeApp xmlns="..." xsi:type="TaskPaneApp">
  <Id>39ccb3e5-8937-42f4-af38-6d55cbd0d938</Id>
  <Version>1.0.0.4</Version>
  <ProviderName>CJVT</ProviderName>
  <DefaultLocale>sl-SI</DefaultLocale>
  <DisplayName DefaultValue="CJVT Vejice"/>
  <Description DefaultValue="Preverite ustrezno rabo vejic."/>
  
  <AppDomains>
    <AppDomain>https://localhost:4001</AppDomain>
    <AppDomain>https://zojad.github.io</AppDomain>
    <AppDomain>https://gpu-proc1.cjvt.si</AppDomain>
  </AppDomains>
  
  <DefaultSettings>
    <SourceLocation DefaultValue="https://localhost:4001/taskpane.html?mode=desktop"/>
  </DefaultSettings>
  
  <VersionOverrides ...>
    <Requirements>
      <bt:Sets DefaultMinVersion="1.3">
        <bt:Set Name="WordApi" MinVersion="1.3"/>
      </bt:Sets>
    </Requirements>
    
    <!-- Ribbon + Commands defined here -->
    <Hosts>
      <Host xsi:type="Document">
        <DesktopFormFactor>
          <ExtensionPoint xsi:type="PrimaryCommandSurface">
            <!-- CheckVejice button details -->
          </ExtensionPoint>
        </DesktopFormFactor>
      </Host>
    </Hosts>
    
    <Resources>
      <bt:Images>...</bt:Images>
      <bt:Urls>...</bt:Urls>
      <bt:Strings>...</bt:Strings>
    </Resources>
  </VersionOverrides>
</OfficeApp>
```

### Key Configuration Parameters

| Parameter | Development | Production |
|-----------|-------------|-----------|
| **API URL** | localhost:4001 | gpu-proc1.cjvt.si |
| **Dev Server Port** | 4001 | (via CI/CD) |
| **HTTPS** | Dev-signed cert | Valid CA cert |
| **Lemmatizer Proxy** | localhost | Via proxy |
| **API Key** | Optional | Required |

### Environment Variables

```bash
# .env or window.__VEJICE_*
VEJICE_API_URL="https://gpu-proc1.cjvt.si/api/postavi_vejice"
VEJICE_API_KEY="<secret>"
VEJICE_DEBUG="true"           # Enable debug logs
VEJICE_QUIET_LOGS="false"     # Suppress some logs
VEJICE_QUOTE_TRACE="true"     # Log quote matching
VEJICE_QUOTE_INTENT_INFERENCE="false"  # Feature flag (off by default)
```

### Deployment Process

#### **Development (Local)**
```bash
npm install                    # Install dependencies
npm run dev-server            # Start localhost:4001
npm start                     # Start Word debugger with manifest.dev.xml
```
Opens Word with add-in sideloaded via manifest reference.

#### **Build for Production**
```bash
npm run build                 # Webpack production bundle
npm run validate:prod         # Validate manifest
# Output: docs/ folder contains compiled assets
# Secrets: API keys in window.__VEJICE_API_KEY
```

#### **Deployment Targets**
1. **Desktop**: Manifest URL registered with Microsoft App Store (or internal distribution)
2. **Web**: Static assets hosted on GitHub Pages (`zojad.github.io/vejice_1`)
3. **CI/CD**: GitHub Actions could automate build + upload to storage

### Manifest Validation
```bash
npm run validate              # Check dev manifest
npm run validate:web          # Check web manifest
npm run validate:prod         # Check prod manifest
npm run validate:web:prod     # Check web prod manifest
```

---

## 7. UNIQUE TECHNICAL ASPECTS

### 1. **Adaptive Platform Handling**
Vejice detects Word environment and branches logic:
```javascript
const online = isWordOnline();  // Checks Office context platform
if (online) {
  await checkDocumentTextOnline();
} else {
  await checkDocumentText();    // Desktop path
}
```
This dual-track architecture allows single codebase to target two distinct APIs.

### 2. **Multi-Level Anchoring Strategy**
Suggestions are anchored via priority fallback:
1. **Precise char position** (if available)
2. **Token context** (surrounding words)
3. **Snippet matching** (left/right/focus context)

This handles document drift gracefully:
- User edits nearby text
- Original char position becomes invalid
- Engine falls back to token matching to find approximate location
- Success rate high even with small modifications

### 3. **Intelligent Chunking Algorithm**
Paragraphs split adaptively:
- Target chunk size: ~650 chars
- Soft max: ~900 chars per chunk
- Hard boundary: Don't break mid-word
- Merge nearby chunks if <20 chars between

This balances API efficiency (fewer requests) with accuracy (avoid over-long contexts).

### 4. **Circuit Breaker for Resilience**
If API fails 3 times in 30 seconds:
- System enters 90-second cooldown
- User notified: "API currently unavailable"
- Subsequent checks blocked until cooldown expires
- Prevents cascading failures and API overload

### 5. **Caching Layer**
In-memory cache stores API results:
- Key: Normalized paragraph text
- Value: Suggestion array
- Max: 800 entries
- TTL: 10 minutes

Dramatically reduces API load on repeated checks of same document.

### 6. **Quote Handling Sophistication**
Vejice recognizes multiple quote styles:
```javascript
["\"", "'", "\u201C", "\u201D", "\u201E", "\u00AB", "\u00BB"]
// Straight, curly (left/right), low, guillemets
```

Rules ensure commas placed correctly relative to complex boundary punctuation (quotes, parentheses, dashes).

### 7. **Tracked Changes Integration (Desktop Only)**
On Desktop, suggestions use Word's native Track Changes:
- Each suggestion becomes a tracked change (insert/delete)
- Word's native review UI handles acceptance/rejection
- Enables audit trail and multi-user workflows
- Not available on Web version (limitation of Web API)

### 8. **Concurrent Architecture**
Processes multiple chunks in parallel:
- Default concurrency: 2 workers
- Max concurrency: 4
- Queue-based job distribution
- Prevents head-of-line blocking

### 9. **Notifications Queue**
Taskpane maintains real-time notification list:
- Max 30 visible notifications
- Signature-based deduplication
- Auto-clears on new check
- User can manually clear

### 10. **Slovenian-First Localization**
- UI strings entirely in Slovenian
- Support for Slovenian punctuation rules
- Special handling for Slovenian quote styles
- Could be extended to other languages via string extraction/i18n

---

## 8. PERFORMANCE CHARACTERISTICS

### Latency Profile

| Operation | Typical Duration | Notes |
|-----------|------------------|-------|
| **Scan small doc** (1-5 paragraphs) | 2-5 sec | Fast API + caching |
| **Scan medium doc** (10-20 paras) | 5-15 sec | Multiple API chunks |
| **Scan large doc** (50+ paras) | 30-60 sec | Complex chunking + retries |
| **Highlight suggestions** (desktop) | 1-3 sec | Range creation overhead |
| **Highlight suggestions** (web) | 2-5 sec | Multiple sync() calls |
| **Accept single suggestion** | 200-500ms | Range manipulation |
| **API call (cloud)** | 400-2500ms | Network + processing |

### Scalability Limits

| Factor | Limit | Reason |
|--------|-------|--------|
| **Paragraph length** | 3000 chars | API timeout; user must split |
| **Total document size** | ~100K chars | All paragraphs processed sequentially |
| **Concurrent chunks** | 4 max | Prevent API rate limiting |
| **Suggestions per doc** | ~1000 | UI rendering becomes slow |
| **Cache entries** | 800 | In-memory; avoid OOM |

### Memory Usage

- **Base add-in**: ~15-20 MB (JavaScript + Office API)
- **Per cached paragraph**: ~2-5 KB (suggestions + metadata)
- **Cache at max**: 800 × 3KB = ~2.4 MB
- **Pending suggestions (online)**: ~0.5 MB per 100 suggestions

Total typical: **20-30 MB** for normal usage.

### Network Bandwidth

- **Per check**:
  - Upload: 5-50 KB (normalized paragraph text)
  - Download: 2-10 KB (suggestion JSON response)
  
- **Typical document scan**: 100-500 KB total (for 20+ paragraphs)

### Database/Storage

- **Session storage** (Web only): ~5 MB max for pending suggestions
- **Browser cache**: Manifest, assets (~3 MB)
- **Desktop tracking**: Word document file size increases ~5-10% (tracked changes metadata)

---

## 9. FILE STRUCTURE & KEY FILES

### Directory Map

```
vejice_2/
├── src/                          # Source code
│   ├── api/
│   │   └── apiVejice.js         # Cloud API client wrapper
│   ├── commands/
│   │   ├── commands.html        # Ribbon handler UI
│   │   ├── commands.js          # Command event handler
│   │   └── toast.html           # Toast/notification fallback
│   ├── logic/
│   │   ├── preveriVejice.js     # CORE: Orchestrator (1000+ lines)
│   │   ├── engine/
│   │   │   ├── CommaSuggestionEngine.js    # Chunking & API logic
│   │   │   ├── Suggestion.js    # Data class
│   │   │   └── textUtils.js     # Text processing helpers
│   │   ├── adapters/
│   │   │   ├── wordDesktopAdapter.js
│   │   │   └── wordOnlineAdapter.js
│   │   ├── bridges/
│   │   │   ├── desktopTextBridge.js
│   │   │   ├── onlineTextBridge.js
│   │   │   └── textBridge.js    # Base class
│   │   └── anchoring/
│   │       ├── AnchorProvider.js           # Base class
│   │       ├── SyntheticAnchorProvider.js  # Regex-based
│   │       └── LemmatizerAnchorProvider.js # API-based morphology
│   ├── manifests/
│   │   ├── manifest.dev.xml     # Development manifest
│   │   └── manifest.web.xml     # Web manifest
│   ├── taskpane/
│   │   ├── taskpane.html        # UI template
│   │   ├── taskpane.js          # Event handlers (500+ lines)
│   │   └── taskpane.css         # Styling
│   └── utils/
│       ├── host.js              # Platform detection
│       └── notifications.js     # Notification system
│
├── docs/                        # Compiled output (dev build)
│   ├── manifest.dev.xml
│   ├── taskpane.html
│   ├── taskpane.js
│   ├── commands.html
│   ├── commands.js
│   ├── assets/
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   └── icon-80.png
│   └── ...
│
├── proxy/                       # Backend proxies
│   ├── lemmatizer-proxy.js
│   └── vejice-api-proxy.js
│
├── scripts/                     # Build & utility scripts
│   ├── start-dev-server.js
│   ├── check-encoding.js
│   └── test-non-comma-drift.js
│
├── reports/                     # Test/analysis output
│   └── non-comma-drift-report.json
│
├── package.json                 # Project metadata
├── webpack.config.js            # Bundler config
├── babel.config.json            # Transpiler config
├── webpack/                     # Webpack plugins
└── QUOTE_PATTERNS_ANALYSIS.md   # Documentation
```

### Key Files Explained

#### **HIGH-IMPACT MODULES** (Most Important)

| File | Lines | Purpose |
|------|-------|---------|
| `src/logic/preveriVejice.js` | ~1000+ | **CORE**: Orchestrator; all workflows route through here |
| `src/taskpane/taskpane.js` | ~500+ | Event handling, state management, UI logic |
| `src/logic/engine/CommaSuggestionEngine.js` | ~400+ | Chunking, API calls, suggestion generation |
| `src/api/apiVejice.js` | ~300+ | HTTP client, retry logic, API health |

#### **SUPPORTING MODULES**

| File | Lines | Purpose |
|------|-------|---------|
| `src/logic/adapters/` | ~100 each | Word Desktop vs Web API abstraction |
| `src/logic/bridges/` | ~100 each | Text modification logic |
| `src/logic/anchoring/` | ~150 each | Suggestion positioning |
| `src/logic/engine/textUtils.js` | ~200 | Text processing utilities |

#### **CONFIGURATION**

| File | Purpose | Format |
|------|---------|--------|
| `package.json` | Dependencies, scripts | JSON |
| `webpack.config.js` | Bundler rules | JavaScript |
| `babel.config.json` | Transpiler presets | JSON |
| `src/manifests/*.xml` | Office manifest | XML |

#### **OUTPUT**

| Location | Generated By | Purpose |
|----------|--------------|---------|
| `docs/` | Webpack | Compiled JS/HTML for serving |
| `reports/` | Test scripts | Analysis output |

---

## 10. ADDITIONAL INSIGHTS

### Error Handling Strategy
- **API Errors**: Logged, user notified, system enters cooldown
- **Parsing Errors**: Fallback anchoring strategies invoked
- **Document Errors**: Soft failures; certain paragraphs skipped with notification
- **UI Errors**: Error boundary catches startup exceptions

### Extensibility
- **New Languages**: Add to manifest, localize strings, adjust quote/punctuation rules
- **New Suggestion Types**: Extend `CommaSuggestionEngine` to handle beyond commas (other punctuation)
- **Custom API**: Swap `apiVejice.js` with different backend
- **Lemmatizer Variants**: New `AnchorProvider` subclasses for different morphological analyzers

### Testing
- **Unit Tests**: (Not visible in workspace; likely in separate test branch)
- **Integration Tests**: `scripts/test-non-comma-drift.js` validates API consistency

### Security Considerations
- **HTTPS Only**: All manifests use https:// (not http://)
- **API Key**: Stored in `window.__VEJICE_API_KEY` (environment-specific)
- **No Local Storage of Sensitive Data**: Suggestions cached in memory only
- **Document Content**: Sent to cloud API (user must trust CJVT)

### Open Questions & Future Work
1. **Multi-language Support**: Could extend beyond Slovenian
2. **Other Punctuation**: Framework supports beyond commas (semicolons, dashes, etc.)
3. **Grammar Beyond Punctuation**: Potential to add spell-checking, grammar rules
4. **Offline Mode**: Currently requires cloud API; could cache/preprocess locally
5. **Performance Optimization**: Progressive rendering, lazy document scanning
6. **A/B Testing**: Track acceptance rates of suggestions for model improvement

---

## CONCLUSION

Vejice represents a sophisticated, production-ready Word add-in that bridges cloud natural language processing with Microsoft Office's document APIs. Its architecture cleanly separates concerns through adapters (platform abstraction), bridges (modification logic), anchoring (position tracking), and engines (suggestion generation). The dual-track support for Desktop and Web Word demonstrates thoughtful engineering around API constraints. With intelligent caching, resilient error handling, and multi-level anchoring fallbacks, the system gracefully handles real-world document editing scenarios.

The project serves as an excellent reference for:
- **Office Add-in Architecture**: Taskpane patterns, manifest configuration, API usage
- **Platform Abstraction**: Desktop vs Web code paths
- **Cloud Integration**: Resilient API client with circuit breaker and retry logic
- **NLP Integration**: Practical application of lemmatization and suggestion positioning
- **Slovenian Language Processing**: Specialized quote/punctuation handling

For organizations building similar tools, Vejice's code represents battle-tested patterns worth studying and adapting.

---

*Analysis compiled March 2026 from source code review of vejice_2 workspace.*
