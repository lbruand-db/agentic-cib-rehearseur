# Guide for LLMs: Working with rrweb Recording Files

This document provides detailed information about rrweb recording JSON files and how to modify them programmatically.

## rrweb Recording JSON Format

rrweb (record and replay the web) recordings are JSON files containing an array of events that capture DOM changes and user interactions over time.

### Basic Structure

```json
[
  {
    "type": 0,
    "data": {},
    "timestamp": 1234567890123
  },
  {
    "type": 2,
    "data": {},
    "timestamp": 1234567891456
  }
]
```

Each event has:
- **`type`** - Event type (integer)
- **`data`** - Event-specific payload (object)
- **`timestamp`** - Unix timestamp in milliseconds (integer)

### Event Types

| Type | Name | Description |
|------|------|-------------|
| 0 | DomContentLoaded | Initial full DOM snapshot |
| 1 | Load | Page load complete |
| 2 | FullSnapshot | Complete DOM state capture |
| 3 | IncrementalSnapshot | Incremental DOM mutations |
| 4 | Meta | Metadata (viewport, URLs) |
| 5 | Custom | Custom application events |
| 6 | Plugin | Plugin-specific events |

### Common Event Data Structures

#### Type 0/2: Full Snapshot
```json
{
  "type": 2,
  "data": {
    "node": {
      "type": 0,
      "childNodes": [...],
      "id": 1
    },
    "initialOffset": {
      "top": 0,
      "left": 0
    }
  },
  "timestamp": 1234567890123
}
```

#### Type 3: Incremental Snapshot
```json
{
  "type": 3,
  "data": {
    "source": 2,  // MouseMove=0, MouseInteraction=1, Scroll=2, ViewportResize=3, Input=4, etc.
    "positions": [...],  // For mouse movements
    "id": 123,  // Target element ID
    "x": 100,
    "y": 200
  },
  "timestamp": 1234567891456
}
```

#### Type 4: Meta
```json
{
  "type": 4,
  "data": {
    "href": "https://example.com",
    "width": 1920,
    "height": 1080
  },
  "timestamp": 1234567890123
}
```

### Incremental Snapshot Sources

The `source` field in Type 3 events indicates what kind of interaction occurred:

- **0** - MouseMove
- **1** - MouseInteraction (click, dblclick, mousedown, mouseup, etc.)
- **2** - Scroll
- **3** - ViewportResize
- **4** - Input (text input, checkbox, radio, select)
- **5** - TouchMove
- **6** - MediaInteraction
- **7** - StyleSheetRule
- **8** - CanvasMutation
- **9** - Font
- **10** - Log
- **11** - Drag
- **12** - StyleDeclaration

## Modifying rrweb Recordings with LLMs

### 1. Clean Up Sensitive Data

Remove passwords, personal information, or API keys from the recording.

**Task:** Scan events for sensitive data and redact it.

**Targets:**
- Type 3 events with `source: 4` (Input events)
- Look for `data.text` or `data.value` fields
- Search for patterns: emails, passwords, tokens, credit cards

**Example modification:**
```json
// Before
{
  "type": 3,
  "data": {
    "source": 4,
    "text": "user@example.com",
    "id": 45
  },
  "timestamp": 1234567891456
}

// After
{
  "type": 3,
  "data": {
    "source": 4,
    "text": "[REDACTED]",
    "id": 45
  },
  "timestamp": 1234567891456
}
```

### 2. Edit or Remove Events

Remove unwanted portions of the recording.

**Task:** Filter out events within a timestamp range.

**Example:**
```
Remove all events between timestamps 1234567890000 and 1234570000000
```

**Implementation:** Filter the array to exclude events where `timestamp` falls within the range.

### 3. Inject Synthetic Events

Add artificial events to demonstrate scenarios.

**Task:** Insert a new event at a specific timestamp.

**Example - Adding a click event:**
```json
{
  "type": 3,
  "data": {
    "source": 1,  // MouseInteraction
    "type": 2,    // Click (0=mouseup, 1=mousedown, 2=click, etc.)
    "id": 123,    // Element ID to click
    "x": 100,
    "y": 200
  },
  "timestamp": 1234575000
}
```

**Important:** Insert the event in chronological order (sorted by timestamp).

### 4. Speed Up or Slow Down Sections

Modify timestamps to change playback speed.

**Task:** Adjust timestamps in a specific range to compress/expand time.

**Example - 2x speed (compress by half):**
```
For events between timestamp 1234570000 and 1234572000:
- Calculate original duration: 2000ms
- New duration: 1000ms (half)
- Recalculate each event's timestamp proportionally
```

**Algorithm:**
```javascript
const start = 1234570000;
const end = 1234572000;
const speedFactor = 0.5; // 2x speed = compress to 50%

events.forEach(event => {
  if (event.timestamp >= start && event.timestamp <= end) {
    const offset = event.timestamp - start;
    event.timestamp = start + (offset * speedFactor);
  } else if (event.timestamp > end) {
    // Shift all events after the range
    event.timestamp -= (end - start) * (1 - speedFactor);
  }
});
```

### 5. Working with Large Files: TOON Format

rrweb recording JSON files can be very large (several MB) and may exceed LLM context limits or consume excessive tokens.

**Solution:** Use [TOON format](https://github.com/toon-format/toon) (Token-Oriented Object Notation).

**Benefits:**
- **40% fewer tokens** than standard JSON
- **Human-readable** YAML-like indentation with CSV-style tables
- **Lossless** conversion (preserves all data perfectly)
- **Better LLM accuracy** (73.9% vs 70.7% for JSON)
- **Easier editing** - More compact structure

**Conversion Commands:**

```bash
# JSON to TOON
npx @toon-format/cli public/recording.json -o recording.toon

# TOON to JSON
npx @toon-format/cli recording.toon -o public/recording.json

# Pipe to stdin/stdout
cat recording.toon | npx @toon-format/cli > recording.json
```

**Workflow:**
1. Convert large JSON to TOON format
2. Provide TOON file to LLM for modification
3. LLM edits TOON (easier to read/modify)
4. Convert back to JSON

**Example TOON structure:**
```toon
- type, data, timestamp
0, {node: {...}}, 1234567890123
3, {source: 2, positions: [...]}, 1234567891456
3, {source: 4, text: "input"}, 1234567892789
```

## Best Practices

### Validation
- **Preserve JSON structure** - Ensure the output is valid JSON
- **Sort by timestamp** - Events must be in chronological order
- **Check event types** - Use correct type integers (0-6)
- **Validate data fields** - Each event type expects specific data structure

### Safety
- **Backup originals** - Always keep a copy before modifications
- **Test playback** - Verify modified recordings play correctly
- **Incremental changes** - Make small modifications and test
- **Chunk large files** - Split or use TOON format for large recordings

### Common Mistakes to Avoid
- Breaking timestamp ordering
- Using incorrect event type numbers
- Modifying element IDs (breaks references)
- Creating orphaned events (referencing non-existent elements)
- Inconsistent source types in incremental snapshots

## Example Prompts for LLM Processing

### Generate Annotations
```
I have an rrweb recording. Please analyze the events and create
a markdown annotations file with bookmarks for key moments like:
- Page loads (type 0, 1, 2, 4)
- Form submissions (type 3, source 4)
- Button clicks (type 3, source 1)
- Navigations (type 4 with href changes)

Format each bookmark with timestamp, color, and description.
```

### Redact Sensitive Data
```
Please scan this rrweb recording and redact sensitive information:
- Password fields (type 3, source 4, look for password-related IDs)
- Email addresses (in text/value fields)
- API tokens (in any text data)

Replace with "[REDACTED]" and preserve the event structure.
```

### Edit Timeline
```
Remove all events between timestamps X and Y from this rrweb recording.
Ensure the remaining events maintain chronological order and
adjust any relative timestamps if needed.
```

## Resources

- [rrweb Documentation](https://github.com/rrweb-io/rrweb/blob/master/guide.md)
- [rrweb Event Types Guide](https://github.com/rrweb-io/rrweb/blob/master/docs/recipes/event-types.md)
- [TOON Format](https://toonformat.dev/)
- [TOON CLI](https://toonformat.dev/cli/)