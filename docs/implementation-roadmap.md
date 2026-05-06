# eDMS implementacijski nacrt

Ta nacrt pripada samo projektu `D:\Projekti\eDMS`.

GitHub repozitorij: <https://github.com/DejanBozulic/eDMS>

Lokalni razvoj:

- frontend: `http://localhost:5180`
- API: `http://localhost:4000`
- mapa: `D:\Projekti\eDMS`

## Faza 1: Interaktivni prototip

Status: v teku.

Vkljuceno:

- React/Vite frontend
- Express API
- dokumentni register
- iskanje po registru
- zacetni obrazec za nov dokument
- zacasno in-memory shranjevanje dokumentov v API procesu
- lifecycle panel
- naloge: review, e-podpis, Read & understood

Naslednje:

- urediti osnovne validacije v UI
- dodati statusne akcije na dokumentu
- dodati osnovni audit prikaz

## Faza 2: Razvojna baza

Status: zacetna lokalna SQLite baza je vkljucena.

Cilj: dokumenti se shranjujejo trajno tudi po restartu API-ja.

Naloge:

- SQLite baza je v `apps/api/data/edms.sqlite`
- API `GET /documents` bere iz SQLite baze
- API `POST /documents` zapisuje v SQLite bazo
- audit event se zapise ob ustvarjanju dokumenta
- kasneje se model lahko prenese na PostgreSQL ali SQL Server

## Faza 3: SharePoint integracija

Cilj: datoteke se hranijo v SharePoint dokumentni knjiznici.

Naloge:

- ustvariti Microsoft Entra ID app registration
- nastaviti Graph API dovoljenja
- pripraviti SharePoint site in library
- implementirati upload dokumenta
- shraniti `driveId`, `itemId` in `sharePointPath`
- dodati download/view link za dokument

## Faza 4: Workflow

Cilj: dokument gre skozi kontroliran proces.

Naloge:

- Draft -> InReview
- InReview -> Approved
- Approved -> Signed
- Signed -> Effective
- Effective -> Superseded ali Archived
- ustvarjanje nalog za pregledovalce in odobritelje
- zaklepanje uradne verzije

## Faza 5: Podpisovanje

Cilj: dokument ima podpisni dogodek in dokazljivo sled.

Naloge:

- interni podpisni zapis
- re-avtentikacija pred podpisom
- podpisni namen
- povezava podpisa z verzijo dokumenta
- kasnejsi adapter za zunanjega podpisnega ponudnika

## Faza 6: Iskanje in arhiv

Cilj: dokumente je mogoce najti, pregledati in arhivirati.

Naloge:

- napredni filtri
- full-text indeks po vsebini dokumentov
- retention pravila
- archive manifest
- export dokumentacijskega paketa
- Microsoft Purview retention mapping

## Faza 7: Gostovanje

Cilj: prenos aplikacije iz lokalnega razvoja na gostovanje.

Naloge:

- pripraviti produkcijski `.env`
- nastaviti domeno in HTTPS
- nastaviti produkcijsko bazo
- nastaviti Entra ID redirect URI-je
- nastaviti CI/CD iz GitHub repozitorija
- dolociti backup in restore postopek

## Locenost projekta

eDMS uporablja lasten port, lasten GitHub repozitorij in lastno konfiguracijo. Lokalni frontend port za eDMS je `5180`.
