# SharePoint priprava

## Trenutna eDMS lokacija

SharePoint lokacija, ki jo uporabljamo za eDMS:

```text
CTRL-ING d.o.o\INZENIRING - Dokumenti\#eDMS
```

Ta pot je uporabna kot poslovna/lokalna oznaka ciljne knjižnice oziroma mape. Za dejanski Microsoft Graph upload bomo potrebovali se `siteId` in `driveId`.

## Predlagana struktura pod `#eDMS`

- `Drafts`
- `In Review`
- `Effective`
- `Archive`
- `Validation`

## Zahtevana Graph dovoljenja

Za zacetek razvoja:

- `Sites.ReadWrite.All`
- `Files.ReadWrite.All`
- `User.Read`

Za produkcijo je smiselno omejiti dostop na izbran site z `Sites.Selected`.

## Retention

Za dolgorocno arhiviranje uporabite Microsoft Purview retention labels/policies, kjer je mogoce. Aplikacija naj v bazi hrani tudi lasten retention indeks in arhivski manifest.
