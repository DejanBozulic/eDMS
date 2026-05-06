# Implementacijski roadmap

## Sprint 1: Core register

- API vrne dokumente iz baze.
- UI prikaze dokumente iz API.
- Create form ustvari dokumentni zapis.
- Audit event se zapise ob ustvarjanju dokumenta.

## Sprint 2: SharePoint storage

- Entra ID app registration.
- Microsoft Graph client.
- Upload source documenta v izbrano SharePoint knjiznico.
- Shranjevanje `driveId`, `itemId` in `sharePointPath`.

## Sprint 3: Workflow

- Status transition pravila.
- Review/approval taski.
- Zaklepanje odobrene verzije.
- Supersede stare verzije ob novi veljavni verziji.

## Sprint 4: Search

- Iskanje po metapodatkih.
- Indeksiranje izvlecenega teksta.
- Advanced filters: tip, status, lastnik, oddelek, veljavnost, rok pregleda.

## Sprint 5: Signing & archive

- Interni e-podpis z re-avtentikacijo.
- Zunanji podpisni provider interface.
- Archive manifest.
- Retention pravila in export paketa.
