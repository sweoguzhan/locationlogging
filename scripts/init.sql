-- PostGIS extension'ını aktif hale getir
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Database'i oluştur (eğer yoksa)
-- Not: POSTGRES_DB environment variable ile zaten oluşturulacak

-- Tabloları oluştur
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "areas" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "boundary" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "locations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "latitude" DECIMAL(10, 8) NOT NULL,
    "longitude" DECIMAL(11, 8) NOT NULL,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_locations_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "areaId" UUID NOT NULL,
    "latitude" DECIMAL(10, 8) NOT NULL,
    "longitude" DECIMAL(11, 8) NOT NULL,
    "entryTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_logs_areaId" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE
);

-- Indexler (Performance için)
CREATE INDEX IF NOT EXISTS "IDX_locations_userId" ON "locations"("userId");
CREATE INDEX IF NOT EXISTS "IDX_locations_timestamp" ON "locations"("timestamp");
CREATE INDEX IF NOT EXISTS "IDX_logs_userId" ON "logs"("userId");
CREATE INDEX IF NOT EXISTS "IDX_logs_areaId" ON "logs"("areaId");
CREATE INDEX IF NOT EXISTS "IDX_logs_entryTime" ON "logs"("entryTime");

-- Sample data ekle (Test için)
INSERT INTO "users" ("id", "name", "email") VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'Mehmet Ali', 'mehmet@example.com'),
    ('123e4567-e89b-12d3-a456-426614174001', 'Oğuzhan Bey', 'oguzhan@example.com')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "areas" ("id", "name", "boundary", "description") VALUES 
    ('123e4567-e89b-12d3-a456-426614174010', 'Ofis Binası', 
     '{"type":"Polygon","coordinates":[[[28.9784,41.0082],[28.9790,41.0082],[28.9790,41.0090],[28.9784,41.0090],[28.9784,41.0082]]]}',
     'Ana Ofis'),
    ('123e4567-e89b-12d3-a456-426614174011', 'Eğlence Merkezi', 
     '{"type":"Polygon","coordinates":[[[28.9780,41.0075],[28.9785,41.0075],[28.9785,41.0080],[28.9780,41.0080],[28.9780,41.0075]]]}',
     'Bistro&Bar')
ON CONFLICT ("id") DO NOTHING;

-- PostGIS version kontrolü
SELECT PostGIS_Version();

-- Başarılı kurulum mesajı
DO $$
BEGIN
    RAISE NOTICE '🎉 Location Logging Database başarıyla oluşturuldu!';
    RAISE NOTICE '📊 Tablolar: users, areas, locations, logs';
    RAISE NOTICE '🔍 PostGIS Version: %', PostGIS_Version();
END $$; 