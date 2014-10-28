#encoding: utf-8

require 'json'
require 'sequel'

pretty = false

database = Sequel.connect "postgres://postgres:postgres@localhost/bag", encoding: 'UTF-8'

class String
  def round_coordinates(precision)
    self.gsub(/(\d+)\.(\d{#{precision}})\d+/, '\1.\2')
  end
end

features = []

sql = <<-SQL
  SELECT
    points, straatnaam, MIN(huisnummer) AS huisnummer, postcode, plaatsnaam,
    ST_AsGeoJSON(geom) AS geojson, ST_X(ST_Centroid(geom)) AS lat, ST_Y(ST_Centroid(geom)) AS lon
  FROM (
    SELECT DISTINCT ON (identificatie)
      openbareruimtenaam AS straatnaam, huisnummer::int, postcode, plaatsnaam,
      ST_NPoints(geom) AS points, ST_ForceRHR(ST_Force2D(geom)) AS geom
    FROM
      bert.panden_amsterdam
    ORDER BY identificatie, points DESC
  ) g
  GROUP BY straatnaam, postcode, plaatsnaam, geom, points
  ORDER BY points DESC
  LIMIT 450
SQL

database.fetch(sql).all do |row|
  features << {
    type: 'Feature',
    properties: {
      straatnaam: row[:straatnaam],
      huisnummer: row[:huisnummer],
      postcode: row[:postcode],
      plaatsnaam: row[:plaatsnaam],
      centroid: [row[:lat], row[:lon]]
    },
    geometry: JSON.parse(row[:geojson].round_coordinates(6))
  }
end

File.open('data/buildings.json', 'w') do |f|
  geojson = {
    type: 'FeatureCollection',
    features: features
  }
  if pretty
    f.write(JSON.pretty_generate(geojson))
  else
    f.write(geojson.to_json)
  end
end
