# eDMS produktni nacrt

Ta dokument pripada projektu `D:\Projekti\eDMS` in repozitoriju `https://github.com/DejanBozulic/eDMS`.

eDMS je lasten dokumentacijski sistem za kontrolirane dokumente. Aplikacija bo tekla na gostovanju, dokumenti bodo shranjeni v SharePointu, aplikacijska baza pa bo hranila metapodatke, workflow, podpise, revizijsko sled in pravila hrambe.

## Cilj prve verzije

Prva verzija mora omogociti uporabniku:

- pregled registra dokumentov
- ustvarjanje dokumentnega zapisa
- vnos osnovnih metapodatkov
- nalaganje dokumenta v SharePoint
- pregled statusa dokumenta
- posiljanje v pregled in odobritev
- interno e-podpisovanje
- zapis revizijske sledi
- pripravo dokumenta za arhiviranje

## Referencni vzorec

Uradni javni Veeva viri so uporabljeni kot funkcionalni vzor, ne kot kopija produkta:

- Veeva QualityDocs: <https://www.veeva.com/products/vault-qualitydocs/>
- Creating Documents: <https://platform.veevavault.help/en/gr/15085/>
- Searching Vault: <https://platform.veevavault.help/en/gr/442/>
- Video Tutorials: <https://platform.veevavault.help/en/gr/2222/>
- Working in Vault PDF: <https://platform.veevavault.help/assets/downloads/site-users-reference-guide.pdf>
- Approving Documents in Vault: <https://www.veeva.com/eu/resources/approving-documents-in-vault/>

## Glavni moduli

### 1. Register dokumentov

- seznam dokumentov
- filtri po tipu, statusu, lastniku, oddelku in roku pregleda
- iskanje po stevilki, nazivu in metapodatkih
- kasneje full-text iskanje po vsebini dokumentov

### 2. Ustvarjanje dokumenta

- tip dokumenta
- obvezna polja po tipu
- lastnik, oddelek, zaupnost in rok hrambe
- upload izvorne datoteke v SharePoint
- ustvarjanje viewable rendition, ce bo potrebno

### 3. Workflow

Predvideni statusi:

- Draft
- InReview
- Approved
- Signed
- Effective
- Superseded
- Archived

### 4. Naloge

- review task
- approval task
- e-signature task
- Read & understood task
- periodic review task

### 5. E-podpis

MVP uporablja interni podpisni zapis. Kasneje se doda zunanji kvalificirani podpisni ponudnik.

Podpisni zapis mora hraniti:

- podpisnika
- cas podpisa
- verzijo dokumenta
- namen podpisa
- izvor avtentikacije
- referenco na podpisni dogodek

### 6. Arhiv in hramba

- retention leta
- arhivski status
- archive manifest
- export dokumentacijskega paketa
- povezava z Microsoft Purview retention politiko, ce je na voljo

## Minimalni podatkovni objekti

- Document
- DocumentRendition
- WorkflowTask
- Signature
- AuditEvent
- RetentionPolicy
- TrainingAssignment

## Lokalni naslovi

- eDMS frontend: `http://localhost:5180`
- eDMS API: `http://localhost:4000`

Port `5173` ni del eDMS projekta in se ne uporablja za eDMS.
