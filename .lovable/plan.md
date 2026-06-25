Change the app's default color scheme to light mode so first-time visitors land on the light theme.

## Change
- Update the theme provider's `defaultTheme` from `"dark"` (or `"system"`) to `"light"` so users without a stored preference see light mode.
- Keep the existing theme toggle intact — users who previously chose dark will still get dark from localStorage.
- If a `class="dark"` is hardcoded on `<html>` in `src/routes/__root.tsx`, remove it so the provider controls the class.

## Files likely touched
- `src/routes/__root.tsx` (theme provider default, html class)
- Possibly `src/components/theme-provider.tsx` if defaults live there