# Rehearseur Template

A React template for creating interactive playback experiences from [rrweb](https://github.com/rrweb-io/rrweb) recordings with annotation overlays and table of contents navigation.

## Quick Start

Record your web sessions using the [rrweb Chrome extension](https://github.com/rrweb-io/rrweb/tree/master/packages/web-extension), then use this template to create an annotated, navigable playback experience.

```bash
npm install
npm run dev
```

## Repository Structure

```
rehearseur-template/
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies and scripts
├── vite.config.js             # Vite build configuration
│
├── src/
│   ├── main.jsx               # React app entry point with global CSS import
│   ├── App.jsx                # Main app component with RrwebPlayer
│   └── index.css              # Global styles for full-screen layout
│
└── public/
    ├── recording_jupyterlite.json           # rrweb session recording (JSON)
    └── recording_jupyterlite.annotations.md # Markdown annotations with timestamps
```

### File Descriptions

- **`index.html`** - Base HTML template with root div for React mounting
- **`package.json`** - Defines dependencies including React 19, rehearseur library, and Vite
- **`vite.config.js`** - Vite configuration with React plugin
- **`src/main.jsx`** - Renders the App component and imports global styles
- **`src/App.jsx`** - RrwebPlayer component with recording and annotations URLs
- **`src/index.css`** - Full-screen layout styles (removes margins, sets 100% height)
- **`public/recording_jupyterlite.json`** - The rrweb recording file (array of DOM events)
- **`public/recording_jupyterlite.annotations.md`** - Markdown file with bookmarks, timestamps, and descriptions

## Creating Annotations with an LLM

You can use an LLM like Claude to automatically generate annotations from your recording file. This is especially useful for long recordings.

### Step 1: Prepare Your Recording

Export your rrweb recording from the Chrome extension. You should have a `.json` file containing an array of events.

### Step 2: Use an LLM to Generate Annotations

Provide your recording file to an LLM (Claude, ChatGPT, etc.) with a prompt like:

```
I have an rrweb recording of a web session. Please analyze the events and create
a markdown annotations file following this format:

---
version: 1.0.0
title: [Session Title]
---

## Section Name

### Bookmark Title
- timestamp: [timestamp in ms]
- color: #4CAF50
- description: Brief description of what happens at this point

Create logical sections and bookmarks for key moments in the session, such as:
- Page loads and navigations
- Form submissions
- Button clicks
- Modal openings
- Error states
- Successful completions

Here's the recording: [paste your JSON]
```

### Step 3: Review and Refine

The LLM will generate a structured annotations file. Review it and:
- Adjust timestamps if needed
- Add or remove bookmarks
- Modify descriptions to be more meaningful
- Group related actions into logical sections

### Example Annotations Format

```markdown
---
version: 1.0.0
title: My Demo Session
---

## Getting Started

### Homepage Load
- timestamp: 1234567890
- color: #4CAF50
- description: Initial page load showing the welcome screen

### Login Form
- timestamp: 1234570000
- color: #2196F3
- autopause: true
- description: User enters credentials and clicks login button

## Main Workflow

### Dashboard View
- timestamp: 1234572000
- color: #FF9800
- description: Dashboard loads with user data and analytics
```

## Modifying Recording Files with an LLM

The rrweb recording JSON file can also be modified using an LLM to:

### Clean Up Sensitive Data

Remove passwords, personal information, or API keys from the recording:

```
Please scan this rrweb recording and redact any sensitive information like:
- Password fields
- Email addresses
- API tokens
- Credit card numbers

Replace them with placeholder values like "***" or "[REDACTED]"
```

### Edit or Remove Events

Remove unwanted portions of the recording:

```
Please remove all events between timestamps 1234567890 and 1234570000
from this rrweb recording, as they contain internal testing that
shouldn't be in the demo.
```

### Inject Synthetic Events

Add artificial events to demonstrate scenarios:

```
Can you insert a click event on the "Submit" button at timestamp 1234575000
in this rrweb recording? Use the appropriate rrweb event structure.
```

### Speed Up or Slow Down Sections

Modify timestamps to change playback speed:

```
Please adjust the timestamps in this recording to make the section between
timestamp 1234570000 and 1234572000 play 2x faster by halving the time
differences between events.
```

### Working with Large Files: TOON Format

Since rrweb recording JSON files can be very large (often several MB), they may exceed LLM context limits or consume excessive tokens. A recommended approach is to convert the JSON to **[TOON format](https://github.com/toon-format/toon)** (Token-Oriented Object Notation), a compact and human-readable encoding optimized for LLMs, modify it, and convert it back to JSON.

TOON achieves approximately **40% fewer tokens** than standard JSON while maintaining full lossless conversion, making it ideal for LLM processing of large recordings.

#### Convert JSON to TOON:

```bash
npx @toon-format/cli public/recording.json -o recording.toon
```

#### Convert TOON back to JSON:

```bash
npx @toon-format/cli recording.toon -o public/recording.json
```

#### Benefits of TOON Format for LLM Processing

- **Token efficient** - Reduces input size by ~40%, saving on LLM costs
- **Human-readable** - Uses YAML-like indentation with CSV-style tables
- **Lossless** - Preserves all JSON data perfectly
- **Better for LLMs** - Higher accuracy in LLM processing (73.9% vs 70.7%)
- **Easier editing** - More compact structure makes it easier to locate events

**Example workflow:**
```bash
# Convert recording to TOON format
npx @toon-format/cli public/recording.json -o recording.toon

# Provide recording.toon to LLM with instructions like:
# "Remove all events between lines 100-200 that contain sensitive data"

# After LLM modifies the TOON file, convert back to JSON
npx @toon-format/cli recording.toon -o public/recording.json
```

You can also pipe to stdin/stdout for processing:
```bash
cat recording.toon | npx @toon-format/cli > recording.json
```

Learn more: [TOON Format Documentation](https://toonformat.dev/cli/)

### Updating Demos for New Webapp Versions with Selenium

When your web application gets updated and your existing rrweb demo recording becomes outdated, you can use [rrweb-browser-test](https://www.npmjs.com/package/rrweb-browser-test) to convert your recording into Selenium test scripts, update them for the new version, and re-record an updated demo.

![Diagram](https://kroki.io/mermaid/svg/eNrVk78OgkAMh3efoonzQUh0MQYDrLhI4kIYAHtyBu9I7wRNeHj5p6-g16VNp-9LfwW4Ut5UEJ_A5lrNLUgTrFGKxx2SkkRjMmDM7_Vn2QlTAVGHBeDToNRCyR7CdFm1KI12blrJ7Lce4YQdx8cRk_LSDJygaF-Q60-srCDVaSRmUJsegj-9x-wxEbtErbig6iFKz-OQWZSrCJgziByGrFj9H9bX4qHNq8Yh9VzU9W6NHt9ybq9HuHhwzjfo2esRfT3Gi8AbWXn--w==)

<!--
  graph LR                                                                                                                                                                                             
      A[Selenium Script] \-\-\>|selenium with rrweb extension| B[rrweb events.json]                                                                                                                       
      B \-\-\>|LLM extraction or<br/>rrweb-browser-test| A                                                                                                                                                
      B \-\-\>|rrweb/rrvideo| C[Video]                                                                                                                                                                    
      C -.->|?| B                                                                                                                                                                                      
                                                                                                                                                                                                       
      style A fill:#e1f5ff                                                                                                                                                                             
      style B fill:#fff4e1                                                                                                                                                                             
      style C fill:#ffe1f5 
-->

[Edit this diagram](https://niolesk.top/#https://kroki.io/mermaid/svg/eNrVk78OgkAMh3efoonzQUh0MQYDrLhI4kIYAHtyBu9I7wRNeHj5p6-g16VNp-9LfwW4Ut5UEJ_A5lrNLUgTrFGKxx2SkkRjMmDM7_Vn2QlTAVGHBeDToNRCyR7CdFm1KI12blrJ7Lce4YQdx8cRk_LSDJygaF-Q60-srCDVaSRmUJsegj-9x-wxEbtErbig6iFKz-OQWZSrCJgziByGrFj9H9bX4qHNq8Yh9VzU9W6NHt9ybq9HuHhwzjfo2esRfT3Gi8AbWXn--w==)


#### Step 1: Install rrweb-browser-test

```bash
npm install -g rrweb-browser-test
```

#### Step 2: Convert Recording to Selenium Tests

Generate Selenium WebDriver test scripts from your existing rrweb recording:

```bash
rrweb-browser-test --input public/recording.json --output tests/ --framework selenium
```

This creates executable Selenium tests that replay the exact user interactions from your recording.

#### Step 3: Update Tests with AI-Driven Locators

**AI-driven locators are excellent for creating self-healing Selenium scripts** that automatically adapt when UI elements change between versions. Instead of brittle CSS selectors that break on every update, AI-powered locators can intelligently find elements even when their IDs, classes, or structure change.

**Why AI Locators Matter:**
- **Self-healing** - Tests automatically fix broken locators at runtime
- **Reduced maintenance** - Up to 70% less test maintenance effort
- **Version resilience** - Tests continue working across webapp updates
- **Intelligent fallback** - AI finds alternative locators when primary ones fail

**Popular AI Self-Healing Tools:**
- [Healenium](https://github.com/healenium/healenium-web) - Open-source AI-powered self-healing for Selenium
- [BrowserStack Self-Heal](https://www.browserstack.com/docs/automate-self-hosted/selenium/self-healing) - Automatic locator recovery
- [Parasoft Selenic](https://www.parasoft.com/products/parasoft-selenic/) - AI-enhanced Selenium testing

**Using AI Locators with LLMs:**

Provide your updated webapp's HTML to an LLM (Claude, ChatGPT) with:

```
I need to update this Selenium test for a new version of my webapp.
Please update the element locators to be more resilient using:
- Semantic attributes (aria-labels, data-testid, roles)
- Relative locators based on nearby elements
- Text content or visible labels
- Avoiding brittle generated IDs or classes

Old test code: [paste Selenium test]
New webapp HTML: [paste updated HTML structure]
```

The LLM will generate robust, self-healing locators that work across versions.

**Learn more:** [AI-Driven Locators in Selenium: No More Broken Tests](https://vinayksharma.medium.com/ai-driven-locators-in-selenium-no-more-broken-tests-2f49a924bf51)

#### Step 4: Run Updated Tests and Re-record

```bash
# Install Selenium WebDriver
npm install selenium-webdriver

# Run your updated tests
node tests/updated-selenium-test.js

# While the test runs, record it with the rrweb Chrome extension
# This creates your updated demo recording for the new webapp version
```

#### Step 5: Replace Old Recording

```bash
# Save the new recording from Chrome extension downloads
mv ~/Downloads/new-recording.json public/recording.json

# Optionally, use an LLM to generate updated annotations
```

#### Benefits

- **Automated demo updates** - Convert old recordings to maintainable test scripts
- **Version tracking** - Keep different demos for different product versions
- **Quality assurance** - Verify user flows still work after updates
- **Self-healing** - AI locators reduce test breakage by 70%+
- **LLM-assisted** - Get help modernizing locators and handling breaking changes

### Important Notes

- Always backup your original recording before making LLM modifications
- Validate the modified JSON structure is valid rrweb format
- Test the modified recording in the player to ensure it works correctly
- Be cautious with large files - consider chunking them for LLM processing

## Features

- **rrweb Session Playback** - Pixel-perfect replay of recorded web sessions
- **Annotation Overlays** - Driver.js overlays with highlights and descriptions
- **Table of Contents** - Hierarchical navigation with sections and bookmarks
- **Timeline Markers** - Visual indicators on the progress bar for annotations
- **Keyboard Shortcuts** - Space to play/pause, arrows to jump between bookmarks
- **Deep Linking** - URL hash support for linking directly to annotations

## Learn More

- [rrweb](https://github.com/rrweb-io/rrweb) - Web session recording library
- [rrweb Chrome Extension](https://github.com/rrweb-io/rrweb/tree/master/packages/web-extension) - Record sessions in your browser
- [rehearseur](https://github.com/lbruand/rehearseur) - The playback component library used in this template
- [driver.js](https://driverjs.com/) - Annotation overlay library
