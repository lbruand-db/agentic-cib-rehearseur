# Cursor AI Guide: Rehearseur Template

This guide helps Cursor AI (and other AI coding assistants) understand this project and assist users effectively.

## Project Overview

This is a React template for creating interactive playback experiences from rrweb recordings with annotation overlays and table of contents navigation.

**Core Technologies:**
- React 19
- Vite (build tool)
- rrweb (web session recording/playback)
- rehearseur (playback UI library)
- driver.js (annotation overlays)

**Purpose:** Display recorded web sessions with synchronized annotations, bookmarks, and navigation.

## Project Structure

```
rehearseur-template/
├── src/
│   ├── main.jsx          # Entry point - mounts React app
│   ├── App.jsx           # Main component with RrwebPlayer
│   └── index.css         # Global styles (full-screen layout)
├── public/
│   ├── *.json            # rrweb recording files
│   └── *.annotations.md  # Markdown annotation files
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── CLAUDE.md             # LLM guide for rrweb format
└── README.md             # User documentation
```

## Common Tasks

### 1. Adding a New Recording

**User request:** "Add my new recording to the player"

**Steps:**
1. Save the recording JSON to `public/` (e.g., `public/my-recording.json`)
2. Create annotations file: `public/my-recording.annotations.md`
3. Update `src/App.jsx`:
   ```jsx
   <RrwebPlayer
     recordingUrl="/my-recording.json"
     annotationsUrl="/my-recording.annotations.md"
   />
   ```

**Files to modify:** `src/App.jsx`

### 2. Creating Annotations File

**User request:** "Create annotations for my recording"

**Template:**
```markdown
---
version: 1.0.0
title: Session Title
---

## Section Name

### Bookmark Title
- timestamp: 1234567890
- color: #4CAF50
- description: What happens at this moment

### Another Bookmark
- timestamp: 1234570000
- color: #2196F3
- autopause: true
- description: Important step (auto-pauses playback)
```

**Key fields:**
- `timestamp` - Time in milliseconds (find in recording JSON)
- `color` - Hex color for the bookmark marker
- `autopause` - Optional, pauses playback at this point
- `description` - Text shown in the overlay

**Files to create:** `public/*.annotations.md`

### 3. Styling Modifications

**User request:** "Change the player size/colors/layout"

**Files to check:**
- `src/index.css` - Global styles (viewport, body, #root)
- `src/App.jsx` - Inline styles or className props
- CSS modules if user creates them

**Common modifications:**
- Full-screen layout: Already in `index.css`
- Player dimensions: Modify styles in `App.jsx`
- Annotation colors: In `.annotations.md` files

### 4. Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**User asks to run the project:** Use `npm run dev`

**User asks to build:** Use `npm run build`

### 5. Recording File Analysis

**User request:** "Find all click events in the recording"

**Approach:**
1. Read the JSON file from `public/*.json`
2. Filter for events where:
   - `type === 3` (IncrementalSnapshot)
   - `data.source === 1` (MouseInteraction)
   - `data.type === 2` (Click)

**Example code:**
```javascript
const clicks = recording.filter(event =>
  event.type === 3 &&
  event.data.source === 1 &&
  event.data.type === 2
);
```

**Reference:** See `CLAUDE.md` for complete rrweb event format details.

### 6. Modifying Recording Files

**User request:** "Remove sensitive data from the recording"

**Approach:**
1. Read `CLAUDE.md` for rrweb event format
2. For large files, suggest TOON format conversion:
   ```bash
   npx @toon-format/cli public/recording.json -o recording.toon
   ```
3. Modify the recording (redact data, remove events, etc.)
4. Convert back if using TOON:
   ```bash
   npx @toon-format/cli recording.toon -o public/recording.json
   ```

**Files to reference:** `CLAUDE.md` (complete event format guide)

### 7. Generating Annotations with AI

**User request:** "Generate annotations from my recording"

**Approach:**
1. Read the recording JSON file
2. Analyze key events:
   - Type 0/1/2/4: Page loads, navigation
   - Type 3, source 1: Clicks
   - Type 3, source 4: Form inputs
   - Type 3, source 2: Scrolls
3. Create logical bookmarks at important moments
4. Write to `public/*.annotations.md`

**Example prompt to use:**
```
Analyze this rrweb recording and create bookmarks for:
- Initial page load
- Navigation events (URL changes)
- Form submissions
- Button clicks
- Modal/dialog openings
- Error states or success messages

Group related actions into sections.
```

### 8. Updating Dependencies

**User request:** "Update React/rrweb/dependencies"

**Files to modify:**
- `package.json` - Update version numbers
- Run `npm install` after changes
- Test with `npm run dev`

**Key dependencies:**
- `react` + `react-dom` - UI framework (currently v19)
- `rehearseur` - Playback component library
- `rrweb-player` - Core playback functionality
- `vite` - Build tool

## Understanding the Data Flow

1. **Recording Creation:**
   - User records session with rrweb Chrome extension
   - Extension exports JSON file
   - File contains array of events (DOM snapshots, interactions)

2. **Annotation Creation:**
   - User creates `.annotations.md` file manually
   - OR uses LLM to generate from recording JSON
   - Annotations reference timestamps from recording

3. **Playback:**
   - App loads recording JSON and annotations
   - `RrwebPlayer` component replays events
   - Annotations trigger overlays at specified timestamps
   - Table of contents provides navigation

## Key Files Explained

### `src/App.jsx`
Main component that renders the player. Modify to:
- Change recording/annotation files
- Add custom styling
- Configure player options

### `src/main.jsx`
Entry point - rarely needs modification unless:
- Adding global providers (Context, Redux)
- Importing additional global styles
- Setting up error boundaries

### `public/*.json`
rrweb recording files. Structure:
- Array of events
- Each event has `type`, `data`, `timestamp`
- See `CLAUDE.md` for complete format

### `public/*.annotations.md`
Markdown files with YAML frontmatter. Structure:
- Frontmatter: `version`, `title`
- Sections with `##` headers
- Bookmarks with `###` headers + metadata list

## Troubleshooting

### Player not loading
1. Check recording file path in `App.jsx`
2. Verify JSON is valid
3. Check browser console for errors
4. Ensure file is in `public/` directory

### Annotations not appearing
1. Check annotations file path in `App.jsx`
2. Verify timestamps match recording
3. Validate YAML frontmatter syntax
4. Ensure timestamps are in milliseconds

### Recording playback issues
1. Verify recording JSON structure
2. Check for timestamp ordering (must be chronological)
3. Look for missing Full Snapshot events (type 0 or 2)
4. Test with original unmodified recording

### Build failures
1. Check Node version (needs modern version for React 19)
2. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check for syntax errors in JSX files
4. Verify all imports are correct

## Best Practices

### When modifying recordings:
- Always backup original files
- Use TOON format for large files (40% token reduction)
- Maintain timestamp chronological order
- Test playback after modifications
- See `CLAUDE.md` for detailed modification guide

### When creating annotations:
- Use consistent color scheme
- Group related actions into sections
- Add `autopause: true` for important steps
- Keep descriptions concise (1-2 sentences)
- Test each bookmark plays at correct time

### When adding features:
- Keep components simple (this is a template)
- Avoid over-engineering
- Prefer configuration over code changes
- Document any new files or patterns

## Working with Large Recordings

**Problem:** Recording JSON files can be 5-50MB, causing:
- Slow load times
- High memory usage
- Difficult to edit

**Solutions:**

1. **Use TOON format for LLM processing:**
   ```bash
   npx @toon-format/cli public/large-recording.json -o recording.toon
   # Edit with LLM (40% fewer tokens)
   npx @toon-format/cli recording.toon -o public/large-recording.json
   ```

2. **Split recordings:**
   - Extract time ranges into separate files
   - Create multiple annotation files
   - Link between recordings in descriptions

3. **Optimize events:**
   - Remove excessive MouseMove events
   - Remove redundant snapshots
   - Compress timestamp intervals

## Example Prompts for Users

When users ask vague questions, suggest specific actions:

**"Make the player better"** → Ask:
- Do you want to change the visual style?
- Add keyboard shortcuts?
- Modify the timeline controls?
- Customize annotation appearance?

**"Fix the recording"** → Ask:
- What's not working? (not loading, wrong playback, missing events)
- Any console errors?
- Did you modify the file?

**"Add a new demo"** → Guide:
1. Export recording from rrweb extension
2. Save to `public/demo-name.json`
3. Create `public/demo-name.annotations.md`
4. Update `src/App.jsx` with new paths

## Resources

- [rrweb Docs](https://github.com/rrweb-io/rrweb)
- [rehearseur Library](https://github.com/lbruand/rehearseur)
- [Vite Guide](https://vitejs.dev/guide/)
- [React 19 Docs](https://react.dev/)
- [TOON Format](https://toonformat.dev/)
- `CLAUDE.md` - Complete rrweb event format reference
- `README.md` - User-facing documentation