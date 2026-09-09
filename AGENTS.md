# Project Rules

This is a small internal company football team builder.

Tech stack:
- React
- Vite
- TypeScript
- GitHub Pages
- Google Apps Script
- Google Sheets
- Google Drive

Architecture rules:
- Do not use Firebase.
- Do not use Supabase.
- Do not introduce SQL databases.
- Do not introduce a VPS or paid service.
- UI components must not directly access Google APIs.
- Use repository/service abstractions.
- Develop frontend against mock repositories before integrating the backend.
- Guest players are runtime entities and must not be persisted as normal players.
- Do not implement player positions.
- Do not implement attendance.
- Do not implement match history.
- Keep the solution simple and maintainable.
- Do not expand scope without explicit approval.

Development rules:
- Work phase by phase.
- Run tests and type checking after meaningful changes.
- Do not silently ignore failing tests.
- Do not start the next phase until the current phase satisfies its acceptance criteria.