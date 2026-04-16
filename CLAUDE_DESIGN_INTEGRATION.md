# Claude-Inspired Design System Integration Guide

You've successfully installed the Claude-inspired design system! Here's how to use it in your Treasury Webapp.

## Files Added/Updated

1. **DESIGN.md** — Complete design specification inspired by Claude (Anthropic)
   - Visual theme, color palette, typography, components, spacing, responsive behavior
   - Read this for comprehensive design guidelines

2. **src/styles/designTokens.css** — Updated with Claude's warm, editorial color system
   - Warm parchment backgrounds (#f5f4ed)
   - Terracotta brand accent (#c96442)
   - Warm-toned neutrals (no cool grays)
   - Serif fonts for headings, sans for body/UI
   - Ring-based shadow system

3. **src/styles/claudeComponents.css** — Ready-to-use component styles
   - Button variants (primary, secondary, light, dark)
   - Card and container styles
   - Form and input styles
   - Typography and section styles
   - Utility classes

## How to Use

### Option 1: Progressive Adoption (Recommended)
Apply the Claude design system gradually to new features and components:

1. **Import the styles** in your components:
   ```jsx
   import '../styles/claudeComponents.css';
   ```

2. **Use the CSS classes** in your React components:
   ```jsx
   <button className="btn-primary">Save Changes</button>
   <div className="card-light">Content here</div>
   <h2>Section Title</h2>
   <p className="text-secondary">Secondary text</p>
   ```

3. **Reference design tokens** in inline styles or CSS modules:
   ```css
   color: var(--text-primary);      /* Anthropic Near Black */
   background: var(--bg-parchment); /* Warm cream background */
   border-color: var(--border-warm); /* Warm sand tone */
   ```

### Option 2: Full Redesign
Replace your current design tokens and apply the Claude system across the entire app.
This is a larger undertaking but creates a cohesive, editorial experience.

## Key Design System Colors

### Light Mode (Default)
- **Background**: Parchment (#f5f4ed) — warm cream, feels like paper
- **Cards**: Ivory (#faf9f5) — slightly whiter, elevated surfaces
- **Text**: Anthropic Near Black (#141413) — primary text/headings
- **Accent**: Terracotta Brand (#c96442) — primary CTA buttons only
- **Borders**: Warm cream tones, never cool gray

### Dark Mode
- **Background**: Anthropic Near Black (#141413)
- **Cards**: Dark Surface (#30302e) — warm charcoal
- **Text**: Ivory (#faf9f5) — light text on dark
- **Borders**: Dark Surface (#30302e)

## Typography Philosophy

### Headings (Serif — Georgia fallback)
Use the serif font-family for:
- All h1, h2, h3, h4 elements
- Display/hero text
- Section titles
- Card titles

Weight: **500 only** (no bold 700+)

### Body & UI (Sans — System fonts)
Use the system font-family for:
- Body paragraphs
- Button text
- Navigation
- Form labels
- All functional UI

### Line Heights
- **Headings**: 1.10–1.30 (tight, literary)
- **Body text**: 1.60 (generous, readable)

## Component Examples

### Button: Warm Sand (Secondary)
```jsx
<button className="btn-secondary">Secondary Action</button>
```
Background: Warm Sand (#e8e6dc)
Text: Anthropic Near Black (#141413)
Ring shadow on interactive states

### Button: Terracotta Brand (Primary CTA)
```jsx
<button className="btn-primary">Primary Call to Action</button>
```
Background: Terracotta Brand (#c96442)
Text: Ivory (#faf9f5)
Use sparingly — only for the highest-signal actions

### Card with Ring Shadow
```jsx
<div className="card-light">
  <h3>Card Title</h3>
  <p>Card description goes here.</p>
</div>
```
Ivory background, subtle warm border, whisper shadow

### Dark Section
```jsx
<section className="section-dark">
  <h2>Dark Section Title</h2>
  <p>Content with Warm Silver text.</p>
</section>
```

## Spacing Scale

All spacing uses an 8px base unit:
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 12px
- `--spacing-lg`: 16px
- `--spacing-xl`: 24px
- `--spacing-2xl`: 32px
- `--spacing-3xl`: 48px
- `--spacing-4xl`: 64px

## Border Radius Scale

The Claude design uses soft, approachable corners:
- `--radius-sharp`: 4px (minimal inline elements)
- `--radius-sm`: 6px (small buttons)
- `--radius-md`: 8px (standard buttons, cards)
- `--radius-lg`: 12px (primary buttons, inputs)
- `--radius-xl`: 16px (featured containers)
- `--radius-2xl`: 24px (tag-like elements)
- `--radius-full`: 32px (hero containers)
- `--radius-circle`: 9999px (circular)

## Shadow System

Instead of traditional drop shadows, the Claude system uses:

### Ring Shadows (Interactive States)
```css
box-shadow: 0px 0px 0px 1px #d1cfc5; /* Light surfaces */
box-shadow: 0px 0px 0px 1px #30302e; /* Dark surfaces */
```

### Whisper Shadows (Elevation)
```css
box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 24px;
```

## Do's ✓

- ✓ Use Parchment (#f5f4ed) as the primary light background
- ✓ Use Terracotta (#c96442) only for primary CTAs
- ✓ Keep all neutrals warm-toned
- ✓ Use ring shadows for interactive states
- ✓ Apply generous line-height (1.60) for body text
- ✓ Alternate light and dark sections for chapter-like rhythm
- ✓ Use serif fonts (weight 500) for all headings

## Don'ts ✗

- ✗ Don't use cool blue-grays anywhere
- ✗ Don't bold serif fonts (weight 700+)
- ✗ Don't use pure white as page background
- ✗ Don't apply heavy drop shadows
- ✗ Don't use sharp corners (< 6px) on buttons/cards
- ✗ Don't reduce body line-height below 1.40
- ✗ Don't mix sans-serif fonts for headlines
- ✗ Don't use geometric/tech illustrations

## Migration Checklist

When applying Claude design to an existing component:

- [ ] Update color variables (neutrals, backgrounds, text)
- [ ] Change font-family from sans to serif for headings
- [ ] Increase heading line-heights (1.10–1.30)
- [ ] Increase body line-height to 1.60
- [ ] Replace sharp corners with rounded (8px–12px minimum)
- [ ] Switch from drop shadows to ring shadows
- [ ] Update button styling (Warm Sand secondary, Terracotta primary)
- [ ] Review against DESIGN.md for component-specific guidance

## Next Steps

1. **Start with one component** — maybe your button or card styles
2. **Reference DESIGN.md** for detailed specifications
3. **Use claudeComponents.css as templates** for other components
4. **Test responsiveness** at mobile, tablet, desktop breakpoints
5. **Iterate and refine** — the design is forgiving and warm

## Questions or Customization?

The Claude design system is flexible. You can:
- Adjust warmth by tweaking neutral colors slightly
- Apply the system to just new features (progressive)
- Mix with existing designs during transition
- Customize button sizes, spacing to fit your needs

For the complete design philosophy and component details, see **DESIGN.md**.
