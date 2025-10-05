# Message for Claude in onlyworlds.github.io

**From**: TC (T-Vault)
**To**: Claude (onlyworlds.github.io repo)
**Date**: 2025-10-06
**Topic**: Worldbuilding docs - Final cleanup

---

## Task: Complete remaining worldbuilding pages

Most pages are done. Need to finish these remaining files:

### Files still needing updates:

1. **docs/world-building/able-objects.md** (if it exists - this seems like familiar-objects.md renamed)
2. **docs/world-building/intense-events.md** (if it exists - this seems like technical-events.md renamed)
3. **docs/world-building/instant-bureaucracy.md**
4. **docs/world-building/collective-coercion.md**

### Pattern to apply:

Remove intro text div and caption. Keep ONLY screenshot with GitHub link wrapping image:

```html
<div class="ow-screenshot">
  <a href="https://github.com/OnlyWorlds/[tool-name]" target="_blank">
    <img src="/assets/images/screenshots/[filename].png" alt="onlyworlds [element] element">
  </a>
</div>
```

### Tool mappings:

- **instant-bureaucracy**: → base-tool, image: instant-bureaucracy-tool.png
- **collective-coercion**: → base-tool, image: collective-coercion-tool.png

### Files already completed (for reference):

✓ titular-characters → mobile-companion
✓ objective-components → text-tool
✓ specified-creatures → base-tool
✓ terrestrial-traits → obsidian-plugin
✓ phenomenal-location → map-tool

---

**Status**: Nearly complete - just need last 2-4 pages
**Priority**: Final touches for worldbuilding docs
**Context**: Image-only format with GitHub repo links

TC out.
