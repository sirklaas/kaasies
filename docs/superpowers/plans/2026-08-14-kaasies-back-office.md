# Kaasies’ Back Office Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive `back.html` Order Journey Board with editable actions, persistent local settings and a printable shipping label.

**Architecture:** Keep workflow state in a pure ES module so every mutation can be unit tested without a browser. A separate browser controller renders the three-column interface, connects inputs and stores validated JSON in `localStorage`. Page-specific CSS extends the established Kaasies’ design system without changing storefront behavior.

**Tech Stack:** Semantic HTML5, CSS, vanilla JavaScript ES modules, Node.js built-in test runner, Playwright CLI, browser `localStorage` and print CSS.

## Global Constraints

- Preserve Bungee, Bricolage Grotesque, Asap and the existing Kaasies’ palette.
- Every workflow step is editable, toggleable and reorderable except the locked first step.
- Prototype actions never send real mail, print automatically or mutate real order data.
- Invalid persisted JSON falls back to the standard workflow.
- Desktop uses three columns; mobile exposes the same content in one column.
- Support keyboard focus and `prefers-reduced-motion`.
- There is no Git repository in this workspace, so commit steps are not applicable.

---

### Task 1: Pure Workflow State

**Files:**
- Create: `assets/back-core.mjs`
- Create: `tests/back-core.test.mjs`

**Interfaces:**
- Produces: `DEFAULT_STEPS`, `parseWorkflow(raw)`, `toggleStep(steps,id)`, `moveStep(steps,id,direction)`, `updateStep(steps,id,patch)`, `addStep(steps,step)` and `validateStep(step)`.

- [ ] **Step 1: Write failing tests** for default recovery, locked first step, toggle, reorder, update validation and adding a unique action.
- [ ] **Step 2: Run** `node --test tests/back-core.test.mjs` and verify failure because `assets/back-core.mjs` does not exist.
- [ ] **Step 3: Implement immutable workflow helpers** with explicit validation for non-empty name, type and instruction.
- [ ] **Step 4: Run** `node --test tests/back-core.test.mjs` and verify all workflow tests pass.

### Task 2: High-Fidelity Back Office Shell

**Files:**
- Create: `back.html`
- Create: `assets/back.css`
- Modify: `tests/page-audit.mjs`

**Interfaces:**
- Consumes: established CSS variables and wordmark conventions from `assets/site.css`.
- Produces: stable DOM hooks `data-orders`, `data-steps`, `data-editor`, `data-label`, `data-toast` and `data-back-tab`.

- [ ] **Step 1: Extend the page audit expectation** so `back.html` must have a unique title, description, exactly one h1 and valid local references.
- [ ] **Step 2: Run** `node tests/page-audit.mjs` and verify failure because `back.html` is missing.
- [ ] **Step 3: Build semantic HTML** for header, KPI strip, order rail, journey board, editor and label preview.
- [ ] **Step 4: Add responsive page CSS** using the established palette, heavy outlines, editorial spacing, compact admin controls and print rules for a 100 × 150 mm label.
- [ ] **Step 5: Run** `node tests/page-audit.mjs` and verify the static audit passes.

### Task 3: Interactive Controller and Persistence

**Files:**
- Create: `assets/back.js`
- Modify: `back.html`
- Create: `tests/back-browser.mjs`

**Interfaces:**
- Consumes: all exports from `assets/back-core.mjs` and the DOM hooks from Task 2.
- Produces: order selection, filtering, step selection, toggling, reordering, editing, adding, reset, local persistence, tab switching, action tests and label print preview.

- [ ] **Step 1: Write a Playwright browser script** that asserts the default 13-step render, edits and persists a title, toggles a step, reorders a step, filters orders and opens the label editor.
- [ ] **Step 2: Run** `node tests/back-browser.mjs` against the local server and verify failure because `assets/back.js` is absent.
- [ ] **Step 3: Implement rendering and event delegation** in `assets/back.js`, storing state under `kaasies-back-workflow-v1` and recent test actions under `kaasies-back-log-v1`.
- [ ] **Step 4: Implement editor validation**, explicit prototype feedback, a new-action form and confirmed reset behavior.
- [ ] **Step 5: Run** `node tests/back-browser.mjs` and verify all interaction assertions pass.

### Task 4: Label and Responsive Verification

**Files:**
- Modify: `assets/back.css`
- Modify: `tests/back-browser.mjs`

**Interfaces:**
- Consumes: `data-label`, desktop and mobile layouts from earlier tasks.
- Produces: an inspectable monochrome shipping label and usable mobile workflow.

- [ ] **Step 1: Add browser assertions** for label recipient/order content, mobile tab switching and absence of horizontal overflow at 390 px.
- [ ] **Step 2: Run** `node tests/back-browser.mjs` and verify the new assertions fail before styling corrections.
- [ ] **Step 3: Refine print and mobile CSS** until the label is 100 × 150 mm in print media and the mobile interface has no horizontal overflow.
- [ ] **Step 4: Run** `node tests/back-browser.mjs`, `node --test tests/store-core.test.mjs tests/back-core.test.mjs` and `node tests/page-audit.mjs`.
- [ ] **Step 5: Capture and inspect** desktop, mobile and label screenshots with Playwright.

## Plan Self-Review

- Spec coverage: state, editing, persistence, orders, email/manual actions, label, responsive layout, error recovery and verification each map to a task.
- Placeholder scan: no deferred implementation or unspecified error handling remains.
- Interface consistency: the storage keys, exported helper names and DOM hooks are defined once and reused unchanged.
