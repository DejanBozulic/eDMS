# SharePoint priprava

## Predlagana struktura

- Site: `Dokumentacijski sistem`
- Library: `eDMS Documents`
- Mape po domenah ali tipih dokumentov, ce je to potrebno zaradi pravic.

## Zahtevana Graph dovoljenja

Za zacetek razvoja:

- `Sites.ReadWrite.All`
- `Files.ReadWrite.All`
- `User.Read`

Za produkcijo je smiselno omejiti dostop na izbran site z `Sites.Selected`.

## Retention

Za dolgorocno arhiviranje uporabite Microsoft Purview retention labels/policies, kjer je mogoce. Aplikacija naj v bazi hrani tudi lasten retention indeks in arhivski manifest.
