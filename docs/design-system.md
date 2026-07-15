# Life HQ design system

This system preserves a calm, personal workspace. Reuse its tokens and UI primitives before introducing page-specific styles. Values are defined in `lib/design/` and are intentionally small until multiple pages prove a need for expansion.

## Spacing

- Page content: `px-6 pt-14 pb-28`, growing to `px-8 pt-20` from the small breakpoint
- Domain list: `mt-14`, `gap-5`, and `pb-8`, increasing gently on larger screens
- Domain card interior: `p-7`, growing to `p-8` on larger screens
- Bottom navigation: a fixed, floating control with `px-5 py-2.5`

Keep new layouts mobile-first. Add a spacing token only when the same semantic spacing is used in more than one place.

## Colors

- Canvas: `#ffffff`
- Foreground: `#171717`
- Inverse text: white, with `95%` and `85%` opacity for secondary and muted content
- Domain entrances use muted blue, green, purple, and orange surfaces with low-contrast borders
- Floating navigation uses solid deep navy with a `10%` opacity white border
- Home background contrast layer: deep navy at `55%` opacity; use this single layer rather than decorative gradients

Use semantic exports from `lib/design/colors.ts` rather than creating near-duplicate opacity combinations.

## Shadows

- Card resting shadow: `0 14px 34px rgba(0, 0, 0, 0.18)`
- Card hover shadow: `0 18px 42px rgba(0, 0, 0, 0.22)`

Shadows should stay soft and restrained. Do not use them to create a dashboard-like hierarchy.

## Radius

- Primary card radius: `2.25rem`

Use this generous radius for prominent entry cards. Introduce smaller radii only when a distinct component calls for one.

## Transitions

- Interactive transition: `200ms ease-out`
- Card feedback: a gentle border change with `0.992` active scale

Keep motion limited to direct interaction feedback. Do not add decorative or continuous animation.

## Shared UI primitives

- `Page` provides the mobile-first page frame.
- `Section` provides semantic page sections.
- `Button` owns the shared domain-card action treatment.
- `IconButton` provides consistent icon navigation states.

Domain-specific components belong beside their page under `components/home/`; page-agnostic primitives belong in `components/ui/`.
