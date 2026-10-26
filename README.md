# Localis

Web stranica localis.hr (Next.js, Vercel) s prijavama na edukacije, automatskim ponudama u PDF-u i admin panelom na `/admin`.

## Lokalni razvoj

```bash
npm install
vercel env pull .env.local   # ili kopirati .env.example u .env.local i popuniti
npm run dev
```

Stranica je na [http://localhost:3000](http://localhost:3000).

## Naredbe

- `npm test` - testovi (vitest)
- `npm run lint` - ESLint
- `npm run db:generate` - nova migracija iz `lib/db/schema.ts`
- `npm run db:migrate` - primjena migracija na bazu iz `DATABASE_URL`
- `npm run db:seed` - početni podaci
