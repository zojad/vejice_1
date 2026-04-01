# Review of Vejice Word Add-in Article

## Summary
I've reviewed your article text against the actual codebase. Most of the overall descriptions are accurate, but there are several important technical inaccuracies and omissions that need correction.

---

## INACCURACIES FOUND

### 1. **Confidence Score Calculation - MAJOR INCOMPLETE/MISLEADING**

**Your text:**
> "Podatek ocene natančnosti (meta.confidence) je izračunan na podlagi sider in izvora podatkov. Začetna vrednost je vedno 0,5. Če podatek izvora prihaja iz prve rezervne poti (primerjava žetonov) se prišteje 0,12, če podatka ni na voljo, pa se odbije 0,08. Če pa podatki izvirajo iz druge poti (primerjava izvirnega in ciljnega besedila), se odbije 0,14, v nasprotnem primeru pa prišteje 0,08."

**Issue:** Your description only mentions 3 factors but the actual confidence calculation includes **9 major factors**. This is misleading:

**What the code actually does** (from `CommaSuggestionEngine.js` lines 1593-1678):
- Initial score: 0.5 ✓
- **fromCorrections factor:** +0.12 if true, else -0.08 ✓
- **viaDiffFallback factor:** -0.14 if true, else +0.08 ✓
- **hasPrimaryCharHint factor:** +0.14 if present, else -0.2 **(YOU OMITTED THIS)**
- **Token context factor:** +0.16 (both sides), +0.06 (one side), -0.1 (none) **(YOU OMITTED THIS)**
- **Highlight anchor factor:** +0.08 if present, else -0.04 **(YOU OMITTED THIS)**
- **Repeat token proximity factor:** -0.12 to +0.02 based on distance **(YOU OMITTED THIS)**
- **Delete operation penalty:** -0.03 extra risk **(YOU OMITTED THIS)**
- Finally: clamped to 0-1 range

**Recommendation:** Rewrite this section to include all factors, or clearly state "The confidence calculation involves multiple factors including..." instead of implying completeness.

---

### 2. **Re-chunking Logic - INCORRECT THRESHOLD**

**Your text:**
> "podatki iz rezervnih plasti ... gredo nato skozi filter, ki obdrži popravke vejic, če je teh popravkov 12 ali manj. Če je popravkov več, se niz razdeli na manjše dele in znova pošlje API-ju..."

**Issue:** The threshold is **backwards**. 

**Actual code** (line 29 and 858):
```javascript
const SALVAGE_RECHUNK_MIN_DIFF_OPS = 12;
// Line 858:
if (commaDiffOps.length >= SALVAGE_RECHUNK_MIN_DIFF_OPS && ...)
```

**Correct statement:** If there are **12 or MORE** comma operations, the chunk is split and re-submitted to the API. Not "12 or less".

**Recommendation:** Change to: "Če je popravkov 12 ali več, se niz razdeli na manjše dele in znova pošlje API-ju..."

---

### 3. **Text Processing Thresholds - PARTIALLY INCOMPLETE**

**Your text:**
> "Besedilo je procesirano po odstavkih. Manjši odstavki (do 1200 znakov) so procesirani naenkrat..."

**Accuracy:** Partially correct but incomplete.

**What the code actually does** (lines 17-18 and 390):
```javascript
const MAX_PARAGRAPH_CHARS = 3000;
const PARAGRAPH_FIRST_MAX_CHARS = 1200;
```

**More complete description:** 
- Paragraphs up to 1200 characters are processed as a whole in a single API call
- BUT: Larger paragraphs (up to 3000 chars) may still be processed in one call via lemmatizer-assisted splitting
- Paragraphs over 3000 characters are forcibly split

Your description only mentions the 1200 threshold. It would be more accurate to mention both thresholds.

---

### 4. **Sentence Boundary Protection - CORRECT BUT INCOMPLETE EXAMPLES**

**Your text:**
> "»varovalke«, ki skrbijo, da besedilo ni rezano na napačnih mestih, kot so okrajšave (A. B., npr., itd., sv., prof., dr., d. o. o. in podobno) in datumi (1. 1. 2026)"

**Accuracy:** Correct, but your list is incomplete.

**What the code actually protects** (lines 1910-1930):
1. Generic abbreviations: `K. M.` pattern (multiple letters with dots)
2. Dates: `25. 3. 2008` pattern
3. Specific Slovenian abbreviations: **npr, itd, itn, ipd, idr, oz, tj, dr, mr, ga, gos, prim, prof, doc, mag, jan, feb, mar, apr, jun, jul, avg, sep, okt, nov, dec**
4. Special forms: **d.o.o., d.d., s.p., d.n.o., k.d.**

Your list includes `sv.` but the code doesn't explicitly protect it as a special form. It would be caught by the generic pattern but isn't listed specifically.

**Recommendation:** You could add more examples like "npr., oz., d.o.o." or state that it protects common Slovenian abbreviations and date patterns.

---

## ACCURATE SECTIONS

✓ **Text segmentation by paragraphs and sentences** - Correct
✓ **Processing via API and receiving metadata with corrections** - Correct
✓ **Filtering for comma-only corrections** - Correct  
✓ **Two fallback paths: fromCorrections and viaDiffFallback** - Correct
✓ **Anchor handling (sourceTokenBefore/At/After, targetTokenBefore/At/After)** - Correct
✓ **Two types of corrections: insert and delete** - Correct
✓ **Confidence as a score between 0-1** - Correct
✓ **Error handling and skipping problematic chunks** - Correct

---

## RECOMMENDATIONS

1. **HIGH PRIORITY:** Fix the confidence calculation section - it's significantly incomplete
2. **HIGH PRIORITY:** Fix the 12-operation threshold - it's currently backwards
3. **MEDIUM PRIORITY:** Expand the text processing threshold section to mention the 3000 character limit
4. **MEDIUM PRIORITY:** Verify the abbreviation list - some mentioned (like `sv.`) aren't explicitly protected in code
5. Consider adding a note about the lemmatizer helping with precise character position anchoring (mentioned several times in code but not in your text)
6. Consider explaining the "deterministicConfidence" score that exists alongside the main confidence score (there are two separate confidence systems)

---

## ADDITIONAL TECHNICAL DETAILS NOT IN YOUR ARTICLE

If you want to expand your article, these are interesting implementation details:

### Lemmatizer Impact
- The lemmatizer assists with more reliable token boundary detection
- Impacts both chunking strategy and anchor reliability
- Can be disabled via VEJICE_USE_LEMMATIZER config

### Two Confidence Scoring Systems
1. **Probabilistic confidence** (0-1 score with "high/medium/low" level)
2. **Deterministic confidence** (score-based with "high/low" level for safer application)

### Character Hint Data
- Primary: `targetCharStart/End` (for inserts) or `charStart/End` (for deletes)
- Secondary: `charHint.start/end` (fallback support)
- Critical for precise comma positioning

### Boundary Metadata for Quotes
- `explicitQuoteIntent` handles special logic for commas near quotation marks
- `boundaryMeta.targetBoundaryPos` ensures insertions occur between correct tokens

### API Health Monitoring
Circuit breaker with 3 failures within 30 seconds triggers cooldown (90 seconds)

