## 2026-06-03

### Source of Truth Decision

Discovered that recent chart case study and animation work was being completed in a bridge environment rather than the GitHub-tracked Development workspace.

Decision:
- Development/portfolio-clean becomes the authoritative source of truth.
- All future portfolio work should originate from Development.
- Experimental work may occur elsewhere temporarily, but must be migrated back into Development before implementation.

Reason:
Work completed outside the repository creates gaps in project history and makes progress difficult to track.