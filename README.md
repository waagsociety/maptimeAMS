# Maptime Amsterdam

> Want to learn how to make beautiful maps? Let's do it together! Beginners very welcome!

This repository contains the [website](http://code.waag.org/maptimeAMS), resources and presentations for Maptime Amsterdam.

For more information about Maptime, see [Maptime HQ's website](http://maptime.io/).

Maptime Amsterdam is hosted by [Waag Society](http://waag.org), and is supported by [FIWARE](http://waag.org/en/project/ngsi-compliancy-citysdk-ld-api) and [Smart City SDK](http://waag.org/en/project/smart-citysdk).

![maptimeAMS](images/maptimeAMS.png)

## Buildings GeoJSON

To create the GeoJSON file containing [buildings data](/data/buildings.json), do the following:

- Download [BAG data file](http://geodata.nationaalgeoregister.nl/inspireadressen/atom/inspireadressen.xml) (1.3 GB)
- Import data into PostgreSQL/PostGIS database with NLExtract's [Bag-extract](http://nlextract.readthedocs.org/en/latest/bagextract.html)
- Create buildings table:

```sql
CREATE SCHEMA bert; -- Yes, you need this schema 😑

CREATE TABLE bert.panden_amsterdam AS SELECT
  DISTINCT ON (p.identificatie)
  p.identificatie::bigint, bouwjaar::int,
  ST_ForceRHR(ST_Force2D(ST_Transform(p.geovlak, 4326))) AS geom,
  openbareruimtenaam, huisnummer, huisletter, huisnummertoevoeging, postcode,
  wp.woonplaatsnaam AS plaatsnaam
FROM verblijfsobjectactueelbestaand v
JOIN verblijfsobjectpandactueel vp
  ON vp.identificatie = v.identificatie
JOIN pandactueelbestaand p
  ON vp.gerelateerdpand = p.identificatie
JOIN nummeraanduidingactueelbestaand na
  ON v.hoofdadres = na.identificatie
JOIN openbareruimteactueelbestaand obr
  ON na.gerelateerdeopenbareruimte = obr.identificatie
JOIN woonplaatsactueelbestaand wp
  ON obr.gerelateerdewoonplaats = wp.identificatie
 WHERE wp.identificatie = 3594
```

- Run `ruby buildings.rb`

## Save a single building as SVG from PostgreSQL

```sql
SELECT
  ST_AsSVG(ST_Scale(ST_Translate(ST_Transform(geom, 28992), -121849, -487326), 2, 2))
FROM
  bert.panden_amsterdam
WHERE
  openbareruimtenaam = 'Nieuwmarkt' AND huisnummer = 4
LIMIT 1
```
