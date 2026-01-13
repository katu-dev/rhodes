# Rhodes UI Style Chart

This document defines the visual language of the Rhodes application, based on the tactical/techwear aesthetic (Arknights / Wuthering Waves).

## Colors

### Core Palette
*   **Background**: `zinc-950` (#09090b) - `bg-tech-bg`
*   **Surface**: `zinc-900` (#18181b) - `bg-tech-surface`
*   **Border**: `zinc-700` (#3f3f46) - `border-tech-border`

### Brand Colors
*   **Primary (Cyan)**: `cyan-400` (#22d3ee) - `text-tech-primary`, `bg-tech-primary`
*   **Accent (Yellow)**: `yellow-500` (#eab308) - `text-tech-accent`, `bg-tech-accent`
*   **Danger (Red)**: `red-500` - Used for enemies and alerts.

## Typography

*   **Display Font**: "Outfit" (Sans-serif) - Used for headers and main text.
*   **Mono Font**: "JetBrains Mono" (Monospace) - Used for stats, IDs, and technical details.

## UI Components

### Backgrounds
*   **Dot Grid**: Use the class `bg-tech-grid` for the standard dotted background (radial gradient).
*   **Noise Overlay**: Add a grainy noise overlay for texture (opacity 20%).

### Shapes & Borders
*   **Angled Corners**: Use `clip-angle` or `clip-angle-inv` to create cut corners (45-degree slices) on panels and buttons.
*   **Tech Borders**: `border-tech-border` (1px solid).

### Effects
*   **Glitch Text**: Add `glitch-text` class and `data-text="CONTENT"` attribute for a cyberpunk glitch animation on hover or load.
*   **Backdrop Blur**: Use `backdrop-blur-md` on overlay panels.

## Example Usage

```jsx
<div className="bg-tech-surface border border-tech-border clip-angle p-4">
    <h1 className="text-4xl font-bold glitch-text" data-text="HEADER">HEADER</h1>
    <p className="font-mono text-tech-primary">SYS: ONLINE</p>
</div>
```
