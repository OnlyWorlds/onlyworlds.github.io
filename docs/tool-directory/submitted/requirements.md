---
layout: default
title: Requirements
parent: Submit a Tool
grand_parent: Tool Directory
nav_order: 1
---

# Tool Requirements

What your tool needs to be accepted into the OnlyWorlds Tool Directory.

---

## Free and Open

**Entirely free to use:**
- No microtransactions, unlocks, or advertisements
- No paywalled features or artificial limitations
- No required subscriptions or payments

---

## Schema Compatible

**World data follows OnlyWorlds element schema:**
- Compatible with worldapi JSON import/export
- Works with onlyworlds.com "copy data" / "paste data" features
- Can use partial schema (subset of fields)
- Can add custom fields (won't import to onlyworlds.com but won't break)
- Tools can be fully offline or API-integrated

---

## Documented and Tested

**Basic documentation:**
- README with setup instructions
- Clear explanation of what the tool does
- Usage guide with examples
- Known bugs/limitations documented
- License specified (MIT recommended)

**Evidence of testing:**
- Tested with real world data
- Multiple worlds with different data
- Empty world handling
- Error cases handled gracefully

---

## Technical Checklist

Before submitting, ensure your tool:

- [ ] World data follows OnlyWorlds element schema
- [ ] Can export data compatible with worldapi or worldsync
- [ ] Compatible with onlyworlds.com copy/paste data features
- [ ] Error messages are clear and helpful
- [ ] Tested with real world data
- [ ] If using API: handles authentication securely (localStorage only)

---

## Documentation Checklist

- [ ] README with purpose and features
- [ ] Setup/installation instructions
- [ ] Usage guide with examples
- [ ] Known issues listed
- [ ] License specified

---

## Tips for Success

**Start with Base Tool:**
- Fork [github.com/OnlyWorlds/base-tool](https://github.com/OnlyWorlds/base-tool)
- LLM-ready foundation with proven schema compatibility
- Supports both online (API) and offline (local JSON) modes

**Test Thoroughly:**
- Multiple worlds with different data
- Empty worlds and edge cases
- All element types you support
- If using API: invalid auth and network failures
- Data import/export compatibility

**Document Well:**
- Write for users, not yourself
- Include screenshots or GIFs
- Explain non-obvious features
- List known limitations honestly

---

Ready to submit? See [How to Submit](../how-to-submit/).
