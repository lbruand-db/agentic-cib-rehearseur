---
version: 1
title: JupyterLite Demo Tutorial
---

## Section: Getting Started {#getting-started}

### Annotation: Welcome {#welcome}
---
timestamp: 0
color: #4CAF50
autopause: true
---

Welcome to the JupyterLite demonstration.

### Annotation: Interface Overview {#interface}
---
timestamp: 3000
---

The JupyterLite interface.

## Section: Working with Notebooks {#notebooks}

### Annotation: Notebook Area {#notebook-area}
---
timestamp: 8000
color: #FF9800
autopause: true
---

The main notebook workspace.

```driverjs
const phantom = createPhantom('.jp-Notebook');
if (phantom) {
  driverObj.highlight({
    element: phantom,
    popover: {
      title: 'Notebook Area',
      description: 'This is where you write and execute your code cells.',
      side: 'left',
      align: 'center'
    }
  });
}
```

### Annotation: Running Code {#run-code}
---
timestamp: 14000
color: #9C27B0
---

Execute code with Shift+Enter.

### Annotation: End {#end}
---
timestamp: 18000
color: #E91E63
autopause: true
---

End of the demo.
