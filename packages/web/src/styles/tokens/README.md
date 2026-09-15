# Cookbook design tokens

This directory contains reusable CSS custom properties for the web app. It does not include component classes or apply the tokens to the current React app.

The palette takes its visual direction from `portfolio-page-v1`: the reference site's deep blue-black (`#101c24`), ink (`#17242c`), warm cream (`#f4f1e9`), light cream (`#faf8f2`), and blue-teal (`#087f78`) are preserved. The blue-teal is expanded into a complete brand scale so it can support hover, active, subtle, and high-contrast states.

## File structure

- `primitives.css` contains raw color scales, opacity, spacing, border widths, radii, type values, common sizes, shadows, motion, and z-index values.
- `semantic.css` maps primitives to purposes such as canvas background, primary content, strong border, or success feedback.
- `components.css` provides variable contracts for buttons, form controls, cards, and badges. It defines values only; it does not define CSS classes.
- `index.css` is the single import entry point, in dependency order.

When the app is ready to use the tokens, import `./styles/tokens/index.css` from the global stylesheet. Do not import the three layer files separately unless there is a specific reason to do so.

## Naming convention

Every token starts with `--cb-` to avoid collisions with third-party CSS.

```text
--cb-{category}-{role}-{state}
```

For example, `--cb-button-primary-background-hover` is the hover background for a primary button. A suffix is omitted for the default state.

## Token layers

Use semantic or component tokens in application styles whenever possible:

```css
.recipe-card {
  padding: var(--cb-card-padding);
  color: var(--cb-content-primary);
  background: var(--cb-card-background);
  border: var(--cb-border-width-thin) solid var(--cb-card-border);
  border-radius: var(--cb-card-radius);
  box-shadow: var(--cb-card-shadow);
}
```

Primitive tokens are appropriate when no semantic role exists, such as a one-off gap or icon size:

```css
.recipe-card__header {
  gap: var(--cb-space-3);
}
```

Avoid using a raw hex value in component CSS. If a needed role is missing, add a semantic token rather than binding the component directly to a palette step.

## Color meaning

### Brand and neutral colors

- **Brand blue-teal** is for primary actions, links, focus, selection, and branded accents. `600` is the reference shade, lighter steps are subtle surfaces, and darker steps are interaction states or text.
- **Cream canvas** (`--cb-background-canvas`) is the default page backdrop.
- **Light cream and white surfaces** distinguish content areas placed on the canvas.
- **Ink and blue-black content** provide readable text and inverse surfaces without using featureless pure black.

### Status colors

- **Info / brand** calls attention to helpful, neutral information.
- **Success / green** means an operation succeeded or a state is healthy.
- **Warning / amber** means care is needed, but the action is not inherently destructive.
- **Danger / red** means an error or destructive outcome.

Color should not be the only way status is communicated. Pair it with text and, when useful, an icon.

## Button meaning and variations

- **Primary** is the most important action in the current context. Prefer one primary button per action group.
- **Neutral** is a normal action that has no success or destructive meaning.
- **Positive** confirms, saves, approves, adds, or completes something successfully.
- **Warning** asks the user to proceed carefully without implying permanent damage.
- **Danger** deletes, removes, disconnects, or performs another destructive action.
- **Secondary** is the outlined, lower-emphasis companion to a primary action.
- **Ghost** is for the lowest-emphasis actions, commonly in toolbars or compact menus.

Each filled button scheme includes default, hover, and active backgrounds, along with content and border colors. Secondary and ghost schemes provide the same interaction progression. All button types share sizing, radius, typography, and disabled-opacity tokens.

Example implementation:

```css
.button {
  min-height: var(--cb-button-height-md);
  padding-inline: var(--cb-button-padding-inline-md);
  border: var(--cb-button-border-width) solid;
  border-radius: var(--cb-button-radius);
  font-size: var(--cb-button-font-size);
  font-weight: var(--cb-button-font-weight);
}

.button--primary {
  color: var(--cb-button-primary-content);
  background: var(--cb-button-primary-background);
  border-color: var(--cb-button-primary-border);
}

.button--primary:hover {
  background: var(--cb-button-primary-background-hover);
  border-color: var(--cb-button-primary-border-hover);
}

.button--primary:active {
  background: var(--cb-button-primary-background-active);
}

.button:disabled {
  cursor: not-allowed;
  opacity: var(--cb-button-disabled-opacity);
}
```

## Typography

The font-family stacks use locally available fallbacks and make no network request. `Manrope` and `DM Mono` appear first to match the reference project if those fonts are loaded later by the app.

Typography is separated into composable properties because CSS custom properties cannot hold a portable bundle of declarations. For body copy, for example, use all four body tokens:

```css
.body-copy {
  font-size: var(--cb-text-body-size);
  font-style: var(--cb-text-body-style);
  font-weight: var(--cb-text-body-weight);
  line-height: var(--cb-text-body-line-height);
}
```

- `regular`, `medium`, `semibold`, and `bold` standardize emphasis.
- `normal` and `italic` standardize font style.
- Body, label, caption, heading, emphasis, and quote aliases describe common text roles.

## Borders, radii, opacity, and spacing

- Border widths are named `thin` (1px), `medium` (2px), and `thick` (4px).
- Radii progress from `none` through `2xl`; `round` is for circles and `pill` is for capsules.
- Opacity runs from `0` through `100`. Prefer semantic disabled and overlay tokens when they match the use case.
- Spacing follows a 4px base. The number in a token is the number of quarter-rem units: `--cb-space-4` is `1rem`, normally 16px.

## Accessibility guidance

- Use the provided content/background pairings together. They were chosen for readable contrast; swapping arbitrary palette steps may not be accessible.
- Keep visible keyboard focus. `--cb-focus-ring-color`, `--cb-border-focus`, and `--cb-shadow-focus` are available for this.
- Do not reduce normal body text opacity to create muted text; use `--cb-content-secondary` or `--cb-content-tertiary`.
- Respect `prefers-reduced-motion` when applying duration and easing tokens.
- Test final components in context, especially when placing text over images or nonstandard backgrounds.
