```markdown
# Design System Document: Medical Precision & Tonal Depth

## 1. Overview & Creative North Star
**Creative North Star: The Clinical Sanctuary**
Medical warehouse management often suffers from "data fatigue"—overwhelming grids, harsh lines, and cluttered interfaces. This design system rejects the "industrial spreadsheet" aesthetic in favor of a **Clinical Sanctuary**. We move beyond standard UI by utilizing high-end editorial layouts, intentional asymmetry, and a "No-Line" philosophy. 

The goal is to create an environment that feels as sterile, organized, and high-tech as a modern surgical suite. We achieve this through "The Layered Aesthetic": replacing rigid borders with tonal shifts and using sophisticated typography to guide the eye, making complex inventory data feel breathable and intuitive.

---

## 2. Colors & Surface Philosophy
The palette is rooted in **Medical Blue (#0066FF)**, but its power comes from the surrounding neutrals. 

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for defining sections. Content containment must be achieved through **Background Color Shifts**.
*   **Surface-to-Container transition:** A card should not have a border; it should be a `surface-container-lowest` object sitting on a `surface-container-low` background. 
*   **Logical Grouping:** Use white space and subtle tonal shifts (`surface` to `surface-variant`) to separate modules.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass and high-grade polymers.
*   **Level 0 (Base):** `background` (#f8f9fa) – The foundation.
*   **Level 1 (Sectioning):** `surface-container-low` (#f3f4f5) – Sidebar or secondary content areas.
*   **Level 2 (Active Work):** `surface-container-lowest` (#ffffff) – Primary data cards and work surfaces.
*   **Level 3 (Interaction):** `surface-bright` – Hover states and active selections.

### The Glass & Gradient Rule
To prevent a "flat" corporate feel, use **Glassmorphism** for floating elements (modals, tooltips). Apply a `backdrop-blur` of 12px-20px combined with a semi-transparent `surface` color.
*   **Signature Textures:** For high-level stats or Hero CTAs, use a subtle linear gradient from `primary` (#0050cb) to `primary_container` (#0066ff) at a 135-degree angle. This adds "visual soul" and depth.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance technical precision with modern elegance.

*   **Display & Headlines (Manrope):** Use Manrope for all `display-` and `headline-` tokens. Its geometric but slightly rounded nature feels modern and high-end. 
    *   *Directorial Note:* Use `headline-lg` with tight letter-spacing (-0.02em) to create an authoritative, editorial look for dashboard overviews.
*   **Body & UI (Inter):** Inter is the workhorse. Use it for all `title-`, `body-`, and `label-` tokens. Its high x-height ensures readability of serial numbers and medical SKUs at small sizes.
*   **The Hierarchy:** Use `label-sm` in all-caps with 0.05em tracking for category headers to create a "tabbed folder" feel without using actual tabs.

---

## 4. Elevation & Depth
In this system, elevation is a property of light and atmosphere, not just shadows.

*   **The Layering Principle:** Stack `surface-container-lowest` on top of `surface-container-high` to create a natural "lift." 
*   **Ambient Shadows:** For floating modals, use a custom shadow: `0 20px 40px rgba(0, 80, 203, 0.06)`. By tinting the shadow with the `primary` color rather than black, the UI feels vibrant and integrated.
*   **The Ghost Border:** If a boundary is required for accessibility (e.g., input fields), use `outline-variant` at **20% opacity**. It should be felt, not seen.
*   **Backdrop Blur:** Any element with a "floating" Z-index must use a backdrop blur to soften the underlying data, preventing visual "vibration" behind the active element.

---

## 5. Components

### Sidebar Navigation
*   **Layout:** Asymmetrical. Use a wider `surface-container-low` sidebar with heavy bottom-weighting for user profiles.
*   **Active State:** Avoid "pill" backgrounds. Use a `primary` vertical "glow bar" (2px wide) on the far left and transition the text color to `on_primary_fixed_variant`.

### Data Tables & Lists
*   **Strict Rule:** No horizontal or vertical dividers.
*   **Separation:** Use alternating row fills with `surface-container-low` or simply use generous vertical padding (16px+) to let the `body-md` text breathe.
*   **Headers:** Use `label-md` in `on_surface_variant` with a subtle `surface-dim` background bar.

### Stat Cards
*   **Style:** `surface-container-lowest` background. 
*   **Visual Interest:** Use a small, low-opacity gradient sparkline (using `primary` and `secondary` colors) in the background of the card to indicate 24-hour trends without cluttering the foreground.

### Input Fields & Forms
*   **Primitive:** Minimalist. No 4-sided boxes. Use a "bottom-line-only" approach or a very soft `surface-container-high` solid fill with `xl` roundedness (0.75rem).
*   **Focus State:** A 2px `primary` glow on the bottom edge only.

### Buttons
*   **Primary:** Solid `primary` fill, `xl` roundedness. Use `on_primary` for text.
*   **Tertiary (Ghost):** No border. `primary` text color. On hover, use a `primary_container` background at 10% opacity.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place page titles and primary actions on slightly different horizontal planes to create a custom, high-end feel.
*   **Embrace White Space:** If a section feels crowded, increase the padding rather than adding a divider line.
*   **Layer Surfaces:** Use `surface-container` tiers to create hierarchy. Important info goes on the "brightest/lowest" surfaces.

### Don't:
*   **Don't use 100% black text:** Use `on_surface` (#191c1d) to maintain a soft, premium medical look.
*   **Don't use standard drop shadows:** Avoid the "Default CSS Shadow." Use the ambient, tinted shadows defined in the Elevation section.
*   **Don't use 1px dividers:** If you think you need a line, try a 12px gap of `surface-container-low` instead.
*   **Don't crowd the data:** Medical data is critical; if the user is looking at stock levels, the surrounding UI should "recede" into the background.```