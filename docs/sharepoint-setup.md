# SharePoint priprava

## Trenutna eDMS lokacija

SharePoint lokacija, ki jo uporabljamo za eDMS:

```text
CTRL-ING d.o.o\INZENIRING - Dokumenti\#eDMS
```

SharePoint sharing link do mape:

```text
https://ctrling.sharepoint.com/:f:/s/INZENIRING/IgBrq6kbG4_PQ6Kz-nrSnB2XAYKyYGblFUo2o8baeJeQjQ0?e=OBzdqq
```

Iz linka lahko razberemo:

- SharePoint host: `ctrling.sharepoint.com`
- Site path: `/sites/INZENIRING`
- Site URL: `https://ctrling.sharepoint.com/sites/INZENIRING`

Ta pot je uporabna kot poslovna oziroma lokalna oznaka ciljne knjiznice in mape. Za dejanski Microsoft Graph upload bomo potrebovali se `siteId` in `driveId`.

## Predlagana struktura pod `#eDMS`

- `Drafts`
- `In Review`
- `Effective`
- `Archive`
- `Validation`

## Naslednji identifikatorji za Graph API

Ko bo Entra aplikacija pripravljena, lahko `siteId` dobimo prek:

```http
GET https://graph.microsoft.com/v1.0/sites/ctrling.sharepoint.com:/sites/INZENIRING
```

Knjiznice oziroma drive-i se nato dobijo prek:

```http
GET https://graph.microsoft.com/v1.0/sites/{site-id}/drives
```

Za eDMS bomo izbrali drive, ki ustreza knjiznici `Dokumenti` oziroma `INZENIRING - Dokumenti`, in mapo `#eDMS`.

## Zahtevana Graph dovoljenja

Za zacetek razvoja:

- `Sites.ReadWrite.All`
- `Files.ReadWrite.All`
- `User.Read`

Za produkcijo je smiselno omejiti dostop na izbran site z `Sites.Selected`.

## Retention

Za dolgorocno arhiviranje uporabite Microsoft Purview retention labels/policies, kjer je mogoce. Aplikacija naj v bazi hrani tudi lasten retention indeks in arhivski manifest.
