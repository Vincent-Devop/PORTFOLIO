

## Neon persistence addition

The selected persistence layer is the user-provided external Neon PostgreSQL database. The Neon DSN must be stored only as a server-side project secret under `DATABASE_URL`; it must never enter browser code, Git, logs, or committed files. The application adds a small Node API runtime for `/api/health`, `/api/content`, and `/api/contact`, plus a deterministic migration/seed script. `portfolio_content` stores the authentic portfolio content groups as JSONB for future editing workflows, while `contact_submissions` stores validated contact messages with timestamps and an index for reverse-chronological review. The client keeps the portfolio readable without a database response, while contact submission persistence uses the API once the Neon secret is loaded.

## Showcase refinement addition

The project showcase retains AURELL and OralCare+ as authentic entries but adds smoother hover choreography: staged lift, depth shadow, visual scale, saturation, metadata color transition, and controlled movement of the existing project geometry. The hero engineering study now includes a solid faceted dimensional figure with purple material faces and a citrus core layered over the existing particle and structural system; the line geometry remains as supporting structure rather than the only visual form.
