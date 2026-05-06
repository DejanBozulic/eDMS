# eDMS produktni nacrt

Ta aplikacija je zasnovana kot lasten dokumentacijski sistem za kontrolirane dokumente, s SharePointom kot dokumentnim repozitorijem in z aplikacijsko plastjo za metapodatke, workflow, podpise, iskanje, audit trail in hrambo.

## Referencni vzorec

Uradni javni Veeva viri, uporabljeni kot funkcionalni vzor:

- Veeva QualityDocs: <https://www.veeva.com/products/vault-qualitydocs/>
- Creating Documents: <https://platform.veevavault.help/en/gr/15085/>
- Searching Vault: <https://platform.veevavault.help/en/gr/442/>
- Video Tutorials: <https://platform.veevavault.help/en/gr/2222/>
- Working in Vault PDF: <https://platform.veevavault.help/assets/downloads/site-users-reference-guide.pdf>
- Approving Documents in Vault: <https://www.veeva.com/eu/resources/approving-documents-in-vault/>

Ne kopiramo Veeva produkta. Uporabljamo ga kot referenco za pricakovane DMS vzorce: library, create/upload, controlled lifecycle, tasks, workflow, e-podpis, audit in search.

## Moduli prve faze

1. Library/Register
   - seznam dokumentov
   - iskanje po naslovu, stevilki, tipu, lastniku in metapodatkih
   - kasneje full-text indeks vsebine

2. Create/Upload
   - upload datoteke v SharePoint
   - tip dokumenta
   - obvezna polja po tipu
   - readiness status: datoteka, metapodatki, viewable rendition, indexing

3. Workflow
   - Draft
   - InReview
   - Approved
   - Signed
   - Effective
   - Superseded
   - Archived

4. Tasks
   - review task
   - approval task
   - e-signature task
   - Read & Understood task

5. E-signature
   - interna podpisna pot za MVP
   - kasnejsa integracija kvalificiranega ponudnika
   - podpisni zapis: podpisnik, cas, verzija, namen, avtentikacija

6. Archive & Retention
   - retention leta
   - archive manifest
   - audit export
   - povezava z Microsoft Purview retention politiko

## Minimalni podatkovni objekti

- Document
- DocumentRendition
- WorkflowTask
- Signature
- AuditEvent
- RetentionPolicy
- TrainingAssignment

## Naslednji razvojni koraki

1. Povezati frontend z API `GET /documents`.
2. Uvesti lokalno razvojno bazo PostgreSQL ali SQL Server.
3. Izvesti Prisma migracijo.
4. Ustvariti API za create/update/status transition.
5. Dodati SharePoint Graph upload.
6. Dodati Microsoft Entra ID prijavo.
7. Dodati audit middleware.
