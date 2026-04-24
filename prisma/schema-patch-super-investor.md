# Planned Super Investor tables (next schema migration)

Already in schema.prisma via general Company table. For now we add:
- SuperInvestor — name, slug, short bio, era (alive/late), total tracked portfolio value
- SuperInvestorHolding — investor_id, company_id (or symbol), pct_held, qoq_change, as_of

These will be added in a follow-up migration. For Week 4 we render static seed data from a TypeScript registry.
