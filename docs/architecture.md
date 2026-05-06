# Arhitektura

Aplikacija je locena na spletni vmesnik, API in SharePoint dokumentni repozitorij.

```mermaid
flowchart LR
  User[Uporabnik] --> Web[React spletna aplikacija]
  Web --> API[Node API]
  API --> DB[(Aplikacijska baza)]
  API --> Graph[Microsoft Graph API]
  Graph --> SP[SharePoint dokumentna knjiznica]
  API --> Sign[Podpisni ponudnik]
  API --> Audit[Revizijska sled]
```

## Odgovornosti

- SharePoint hrani datoteke in uradne verzije.
- Aplikacijska baza hrani metapodatke, statuse, workflow, revizijsko sled in podpisne dogodke.
- API izvaja poslovna pravila in dostop do Graph API.
- Frontend nudi namenski eDMS vmesnik za uporabnike.
