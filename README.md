# eDMS

Lasten dokumentacijski sistem za obvladovanje dokumentov, podpisovanje in dolgorocno arhiviranje, kjer aplikacija tece na gostovanju, dokumenti pa so shranjeni v SharePointu.

## Moduli

- Register dokumentov z metapodatki, statusi in verzijami
- Workflow: osnutek, pregled, odobritev, podpis, objava, arhiv
- SharePoint integracija preko Microsoft Graph API
- Revizijska sled za spremembe, oglede, prenose, odobritve in podpise
- Pripravljena plast za integracijo zunanjega ponudnika e-podpisa
- Pravila hrambe in arhivski izvoz dokumentacijskega paketa

## Tehnologija

- `apps/web`: React + TypeScript + Vite
- `apps/api`: Node.js + Express + TypeScript + Prisma
- `SharePoint`: dokumentni repozitorij preko Microsoft Graph
- `Microsoft Entra ID`: prijava in avtorizacija
- `PostgreSQL` ali `SQL Server`: aplikacijska baza

## Lokalni zagon

```powershell
npm install
npm run dev
```

Frontend bo privzeto na `http://localhost:5173`, API na `http://localhost:4000`.

## Naslednji produkcijski koraki

1. Ustvari Microsoft Entra ID app registration.
2. Nastavi Graph API dovoljenja za SharePoint knjižnico.
3. Pripravi SharePoint site in document library za uradne dokumente.
4. Nastavi `.env` iz `.env.example`.
5. Izberi podpisnega ponudnika za kvalificirane podpise, ce so zahtevani.
6. Nastavi retention policies v Microsoft Purview ali primerljiv arhivski rezim.
