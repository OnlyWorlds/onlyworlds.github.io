---
layout: default
title: Review Criteria
parent: Submit a Tool
grand_parent: Tool Directory
nav_order: 3
---

# Review Criteria

What we evaluate when reviewing tool submissions.

---

## Security (Must Pass)

**Critical requirements:**
- No malicious code or data theft
- No unauthorized data transmission
- Input sanitization for user data

**If using API:**
- Credentials stored in localStorage only
- HTTPS required for all API calls
- No credential logging or external transmission

---

## Compatibility (Must Pass)

**Schema adherence:**
- Follows OnlyWorlds element schema
- Can use subset of fields (partial implementation OK)
- Data compatible with worldapi import/export or onlyworlds.com copy/paste
- Graceful handling of missing/invalid data

**Custom fields:**
- Allowed and encouraged
- Won't import to onlyworlds.com but won't break
- Feedback on custom fields welcomed for potential schema inclusion

---

## Quality (Evaluated)

**User experience:**
- Clear purpose and use case
- Intuitive interface
- Helpful error messages
- Reasonable performance

**Optional but valued:**
- Mobile responsiveness
- Accessibility features
- Offline functionality
- Dark mode support

---

## Documentation (Evaluated)

**Essential documentation:**
- Setup instructions complete and accurate
- Feature explanation clear
- Examples provided
- License included

**Quality indicators:**
- Code comments present
- Architecture explained
- Contribution guidelines (if open source)
- Screenshots or demos

---

## Common Rejection Reasons

**Security issues:**
- Hardcoded credentials
- Unsafe API key handling
- Data exfiltration patterns

**Compatibility problems:**
- Schema violations that break imports
- Missing required fields
- Incompatible data formats

**Quality concerns:**
- Completely broken functionality
- No documentation
- Obvious bugs in core features

---

## Tips for Approval

**Security:**
- Use Base Tool as reference for auth handling
- Never log API keys
- Sanitize all user inputs

**Compatibility:**
- Test import/export with onlyworlds.com
- Validate against schema
- Handle missing data gracefully

**Quality:**
- Test with real users before submitting
- Include clear README
- Document known issues

**Documentation:**
- Write for first-time users
- Include setup steps
- Show examples

---

## Questions About Criteria?

- **Discord:** [discord.gg/twCjqvVBwb](https://discord.gg/twCjqvVBwb) - #tool-development
- **Email:** info@onlyworlds.com
- **GitHub:** [github.com/OnlyWorlds/OnlyWorlds/issues](https://github.com/OnlyWorlds/OnlyWorlds/issues)

---

See [How to Submit](../how-to-submit/) when you're ready.
