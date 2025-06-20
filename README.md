# 📍 Konum Takip API Sistemi

Modern GPS takip ve coğrafi alan algılama sistemi. NestJS, PostgreSQL (PostGIS), Redis ve Docker ile geliştirilmiş enterprise-grade bir uygulamadır.

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler
- **Node.js** (v18+)
- **Docker** ve **Docker Compose**
- **Git**

### 1. Projeyi İndir
```bash
git clone <repository-url>
cd locationLogging
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Docker Servislerini Başlat
```bash
# Development ortamı için tüm servisleri başlat
docker-compose -f docker-compose.dev.yml up -d

# Servislerin durumunu kontrol et
docker-compose -f docker-compose.dev.yml ps

# Database kurulumunu takip et (15-20 saniye sürer)
docker-compose -f docker-compose.dev.yml logs postgres | tail -10
```

**🎯 Bu adımda otomatik olarak kurulanlar:**
- ✅ **PostgreSQL + PostGIS**: Coğrafi veritabanı sistemi
- ✅ **Redis**: Cache ve job queue sistemi
- ✅ **Database**: `location_logging` veritabanı oluşturulur
- ✅ **Tablolar**: users, areas, locations, logs otomatik kurulur
- ✅ **Test Verileri**: 2 kullanıcı (Mehmet Ali, Oğuzhan Bey) + 2 alan (Ofis, Eğlence Merkezi)
- ✅ **Yönetim Araçları**: pgAdmin ve Redis Commander

### 4. NestJS Uygulamasını Başlat
```bash
# Development modu (otomatik yeniden başlatma)
npm run start:dev

# Production modu
npm run build
npm run start:prod
```

### 5. Sistemi Test Et
- **Ana API**: http://localhost:3000
- **API Dokümantasyonu**: http://localhost:3000/api/docs
- **Veritabanı Yönetimi**: http://localhost:8080 (admin@admin.com / admin123)
- **Cache Yönetimi**: http://localhost:8081
- **Sistem Durumu**: http://localhost:3000/health

## 🐳 Docker Servisleri

| Servis | Port | Açıklama | Erişim |
|--------|------|----------|---------|
| PostgreSQL | 5432 | PostGIS ile coğrafi veritabanı | Database bağlantısı |
| Redis | 6379 | Cache ve job queue sistemi | Cache bağlantısı |
| pgAdmin | 8080 | Veritabanı yönetim arayüzü | http://localhost:8080 |
| Redis Commander | 8081 | Redis yönetim arayüzü | http://localhost:8081 |

## 📚 API Endpoint'leri

### 📍 Konum İşlemleri (Locations)
```bash
# GPS koordinatı gönder (otomatik alan algılama)
POST /locations
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "latitude": 41.0082,
  "longitude": 28.9784
}

# Tüm konumları listele (sayfalama ile)
GET /locations?page=1&limit=10&sortBy=timestamp&sortOrder=DESC

# Kullanıcının konumları
GET /locations/user/{userId}
```

### 🏢 Alan İşlemleri (Areas)
```bash
# Yeni alan oluştur
POST /areas
{
  "name": "Ofis Binası",
  "description": "Ana ofis binası",
  "boundary": {
    "type": "Polygon",
    "coordinates": [[[28.9784, 41.0082], [28.9790, 41.0082], [28.9790, 41.0090], [28.9784, 41.0090], [28.9784, 41.0082]]]
  }
}

# Tüm alanları listele
GET /areas

# Alan güncelle
PATCH /areas/{id}

# Alan sil
DELETE /areas/{id}
```

### 📋 Giriş Kayıtları (Logs)
```bash
# Alan giriş kayıtları (sayfalama ile)
GET /logs?page=1&limit=10&sortBy=entryTime&sortOrder=DESC

# Kullanıcının giriş kayıtları
GET /logs/user/{userId}?page=1&limit=10

# Belirli alanın giriş kayıtları
GET /logs/area/{areaId}

# Tarih aralığında kayıtlar
GET /logs/date-range?startDate=2024-01-01&endDate=2024-01-31

# Kullanıcı + alan bazlı kayıtlar
GET /logs/user/{userId}/area/{areaId}
```

### 👥 Kullanıcı İşlemleri (Users)
```bash
# Yeni kullanıcı oluştur
POST /users
{
  "name": "Mehmet Ali",
  "email": "mehmet@example.com"
}

# Tüm kullanıcıları listele
GET /users

# Kullanıcı bilgilerini güncelle
PATCH /users/{id}

# Kullanıcı sil
DELETE /users/{id}
```

### 🔍 Sistem İşlemleri
```bash
# Sistem durumu kontrolü
GET /health

# API dokümantasyonu
GET /api/docs
```

## 🔧 Sistem Yapılandırması

### Ortam Değişkenleri (Environment Variables)
```bash
# Veritabanı Ayarları
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=location_logging

# Redis Ayarları
REDIS_HOST=localhost
REDIS_PORT=6379

# Uygulama Ayarları
PORT=3000
NODE_ENV=development
```

### pgAdmin Bağlantı Ayarları
```bash
# pgAdmin Web Arayüzü
URL: http://localhost:8080
Email: admin@admin.com
Password: admin123

# PostgreSQL Server Bağlantısı
Host: postgres  # (localhost DEĞİL!)
Port: 5432
Username: postgres
Password: postgres123
Database: location_logging
```

## 🏗️ Proje Dizin Yapısı

```
src/
├── areas/          # Alan yönetimi (CRUD işlemleri)
├── locations/      # GPS koordinat işleme ve alan algılama
├── logs/           # Giriş kayıtları ve sayfalama
├── users/          # Kullanıcı yönetimi
├── entities/       # Veritabanı entity'leri (TypeORM)
├── common/         # Ortak DTO'lar (pagination, validation)
├── config/         # Veritabanı, Redis yapılandırması
└── main.ts         # Uygulama başlangıç noktası

docker-compose.dev.yml  # Development ortamı
scripts/init.sql        # Veritabanı otomatik kurulum
```

## 🎯 Sistem Özellikleri

### ✅ Temel Özellikler
- **GPS Takip**: Gerçek zamanlı konum takibi
- **Coğrafi Alan Algılama**: Point-in-polygon algoritması ile otomatik alan tespiti
- **Otomatik Kayıt**: Alan girişlerini otomatik olarak kaydetme
- **Sayfalama**: Büyük veri setleri için optimize edilmiş sayfalama
- **Duplicate Koruması**: 10 dakika içinde aynı alana tekrar giriş engelleme

### ⚡ Performans ve Dayanıklılık
- **Circuit Breaker Pattern**: Redis bağlantı koptuğunda otomatik fallback
- **Background Processing**: Async job processing ile hızlı response
- **Cache Stratejisi**: Redis ile 5 dakika cache, otomatik invalidation
- **Connection Pooling**: Veritabanı bağlantı optimizasyonu
- **Indexing**: Performans için optimize edilmiş veritabanı indexleri

### 🛡️ Production-Ready Özellikler
- **Kapsamlı Hata Yönetimi**: Graceful error handling ve recovery
- **Health Monitoring**: Sistem durumu kontrolü ve alerting
- **Docker Support**: Container orchestration ve scaling
- **API Dokümantasyonu**: Swagger/OpenAPI ile tam dokümantasyon
- **Security**: Input validation, SQL injection koruması
- **Logging**: Detaylı sistem logları ve monitoring

## 🔍 Sorun Giderme (Troubleshooting)

### Veritabanı Bağlantı Sorunu
```bash
# PostgreSQL servisinin durumunu kontrol et
docker-compose -f docker-compose.dev.yml ps postgres

# PostgreSQL loglarını incele
docker-compose -f docker-compose.dev.yml logs postgres

# Veritabanı kurulumunu kontrol et
docker-compose -f docker-compose.dev.yml logs postgres | grep "database system is ready"
```

### Redis Bağlantı Sorunu
```bash
# Redis servisinin durumunu kontrol et
docker-compose -f docker-compose.dev.yml ps redis

# Redis bağlantısını test et
docker exec -it location-logging-redis redis-cli ping
```

### Port Çakışması Sorunu
```bash
# Kullanılan portları kontrol et
lsof -i :3000  # NestJS
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # pgAdmin
lsof -i :8081  # Redis Commander

# Tüm servisleri durdur ve temizle
docker-compose -f docker-compose.dev.yml down -v
```

### TypeORM Schema Sync Sorunu
```bash
# Eğer "column contains null values" hatası alınırsa:
# 1. Docker servislerini durdur
docker-compose -f docker-compose.dev.yml down -v

# 2. Yeniden başlat
docker-compose -f docker-compose.dev.yml up -d

# 3. Database tekrar kurulana kadar bekleyiniz
docker-compose -f docker-compose.dev.yml logs postgres | tail -20
```

## Test ve Geliştirme

```bash
# Unit testleri çalıştır
npm run test

# E2E testleri çalıştır
npm run test:e2e

# Test coverage raporu
npm run test:cov

# Development modunda çalıştır (otomatik restart)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Monitoring ve Yönetim

### pgAdmin (Veritabanı Yönetimi)
- **URL**: http://localhost:8080
- **Giriş**: admin@admin.com / admin123
- **Server Ekleme**:
  - Host: `postgres` (localhost değil,docker üzerinde çalışıyor)
  - Port: 5432
  - Username: postgres
  - Password: postgres123
  - Database: location_logging

### Redis Commander (Cache Yönetimi)
- **URL**: http://localhost:8081
- **Otomatik bağlantı**: redis:6379

### Sistem Durumu Kontrolü
```bash
# API health check
curl http://localhost:3000/health

# Veritabanı bağlantı testi
docker exec -it location-logging-postgres psql -U postgres -d location_logging -c "SELECT version();"

# Redis bağlantı testi
docker exec -it location-logging-redis redis-cli info server
```

## Production Deployment

### Docker ile Production
```bash
# Production ortamında çalıştır
docker-compose -f docker-compose.yml up -d

# Horizontal scaling
docker-compose -f docker-compose.yml up -d --scale app=3

# Load balancer ile
docker-compose -f docker-compose.yml up -d nginx
```

### Ortam Değişkenleri (Production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/location_logging
REDIS_URL=redis://redis:6379
PORT=3000
```

## API Dokümantasyonu

- **Swagger UI**: http://localhost:3000/api/docs
- **JSON Schema**: http://localhost:3000/api/docs-json
- **Postman Collection**: Swagger'dan export edilebilir

## Katkıda Bulunma

1. Projeyi fork et
2. Feature branch oluştur (`git checkout -b feature/yeni-ozellik`)
3. Değişiklikleri commit et (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'i push et (`git push origin feature/yeni-ozellik`)
5. Pull Request oluştur


## 🎯 Hızlı Başlangıç Özeti

```bash
# 1. Projeyi indir
git clone <repository-url>
cd locationLogging

# 2. Bağımlılıkları yükle
npm install

# 3. Docker servislerini başlat
docker-compose -f docker-compose.dev.yml up -d

# 4. Database hazır olana kadar bekle (15-20 saniye)
docker-compose -f docker-compose.dev.yml logs postgres | grep "🎉"

# 5. NestJS uygulamasını başlat
npm run start:dev

# 6. Test et
# http://localhost:3000/api/docs
```

##  İlk Çalıştırmada Hazır Olan Test Verileri

-  **2 Test Kullanıcısı**: Mehmet Ali, Oğuzhan Bey
- **2 Test Alanı**: Ofis Binası, Eğlence Merkezi
- **Tüm Tablolar**: users, areas, locations, logs (otomatik kurulum)
- **API Örnekleri**: Swagger arayüzünde hazır
- **Sample GPS Koordinatları**: İstanbul bazlı test alanları

**Sistem tamamen otomatik kurulur ve kullanıma hazır hale gelir!** 🚀 
