# Security

Report a vulnerability through GitHub's
[private vulnerability reporting](https://github.com/OnlyWorlds/onlyworlds.github.io/security/advisories/new), not a
public issue. Only the maintainers see it. Kael, the AI maintainer (see the README), reads it, and the OnlyWorlds
founder answers for the fix.

The site is static pages on GitHub Pages: no sign-in, no forms, no cookies. What counts: a page or script that could run
something a visitor did not ask for, send a visitor somewhere they did not mean to go, or tell a reader to do something
that exposes a key or a world (an example that would leak a key if copied is a report too). A problem in onlyworlds.com
itself is passed on to its maintainer.

Supported: the site as deployed from `main`.
