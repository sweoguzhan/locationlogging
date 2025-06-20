# 🐳 DOCKER CHEAT SHEET - KOMPLE REHBER

## 📖 İÇİNDEKİLER
1. [Docker Temel Kavramlar](#temel-kavramlar)
2. [Docker vs Docker Compose](#docker-vs-docker-compose)
3. [Docker Compose Dosya Farkları](#compose-dosya-farklari)
4. [Temel Docker Komutları](#temel-docker-komutlari)
5. [Docker Compose Komutları](#docker-compose-komutlari)
6. [Debugging & Troubleshooting](#debugging-troubleshooting)
7. [Production Best Practices](#production-best-practices)

---

## 🎯 TEMEL KAVRAMLAR

### **IMAGE vs CONTAINER**
```bash
# IMAGE = Hazır tarifname (sadece okunur)
docker images                 # Mevcut image'ları listele

# CONTAINER = Image'den çalışan örnek
docker ps                     # Çalışan container'ları göster
docker ps -a                  # Tüm container'ları göster (durmuş olanlar dahil)
```

### **VOLUME vs BIND MOUNT**
```yaml
# VOLUME (Docker yönetir)
volumes:
  - postgres_data:/var/lib/postgresql/data

# BIND MOUNT (Sen belirtirsin)  
volumes:
  - ./local-folder:/container/path
```

### **NETWORK**
```bash
# Container'lar birbiriyle nasıl konuşur
networks:
  - my-network
```

---

## ⚔️ DOCKER VS DOCKER COMPOSE

### **TEK CONTAINER (Docker)**
```bash
# Tek container çalıştır
docker run -d \
  --name my-postgres \
  -e POSTGRES_PASSWORD=123 \
  -p 5432:5432 \
  postgres:15

# Sorunlar:
# ❌ Her seferinde uzun komut
# ❌ Multiple container yönetimi zor  
# ❌ Network configuration manuel
```

### **MULTIPLE CONTAINERS (Docker Compose)**
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: 123
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

```bash
# Tek komutla tüm stack
docker-compose up -d

# Avantajlar:
# ✅ Tek komut
# ✅ Multiple services  
# ✅ Otomatik network
# ✅ Configuration yönetimi
```

---

## 📁 COMPOSE DOSYA FARKLARI

### **docker-compose.dev.yml (Development)**
```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    ports:
      - "5432:5432"           # Port expose et (debug için)
    volumes:
      - ./scripts:/docker-entrypoint-initdb.d  # Local script'leri bind mount
  
  # Debug tools
  pgadmin:                    # Development UI tool'u
    image: dpage/pgadmin4
    ports:
      - "8080:80"
  
  redis-commander:            # Redis debug tool'u  
    image: rediscommander/redis-commander
    ports:
      - "8081:8081"

# Özellikler:
# ✅ Debug tools dahil
# ✅ Port'lar host'a expose
# ✅ Volume mount'lar kolay development için
# ✅ Hot reload friendly
```

### **docker-compose.yml (Production)**
```yaml
version: '3.8'
services:
  app:                        # Uygulama container'ı da var
    build: .
    depends_on:
      - postgres
      - redis
    restart: unless-stopped   # Production reliability
  
  postgres:
    image: postgis/postgis:15-3.3
    # ports: KAPALI           # Security: port expose etme
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Named volume
    restart: unless-stopped   # Otomatik restart
  
  nginx:                      # Load balancer/reverse proxy
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app

# Özellikler:
# ✅ Security (port'lar kapalı)
# ✅ Reverse proxy
# ✅ Auto restart policies  
# ✅ Named volumes (data persistence)
# ❌ Debug tools yok
```

---

## 🚀 TEMEL DOCKER KOMUTLARI

### **IMAGE YÖNETİMİ**
```bash
# Image listele
docker images
docker image ls

# Image indir
docker pull postgres:15
docker pull redis:7-alpine

# Image sil
docker rmi postgres:15
docker image rm postgres:15

# Image build et
docker build -t my-app .
docker build -t my-app:v1.0 .

# Image history
docker history postgres:15
```

### **CONTAINER YÖNETİMİ**
```bash
# Container çalıştır
docker run -d --name my-container postgres:15    # Background'da
docker run -it --name my-container ubuntu bash   # Interactive

# Container listele
docker ps              # Çalışan
docker ps -a           # Hepsi
docker ps -q           # Sadece ID'ler

# Container durdur/başlat
docker stop my-container
docker start my-container  
docker restart my-container

# Container sil
docker rm my-container
docker rm -f my-container    # Force (çalışsa bile sil)

# Container'a bağlan
docker exec -it my-container bash
docker exec -it my-container psql -U postgres
```

### **LOGS & DEBUG**
```bash
# Log'ları görüntüle
docker logs my-container
docker logs -f my-container         # Follow (canlı takip)
docker logs --tail 100 my-container # Son 100 satır

# Container bilgileri
docker inspect my-container
docker stats my-container           # CPU/Memory kullanımı
```

### **VOLUME YÖNETİMİ**
```bash
# Volume listele
docker volume ls

# Volume detayları
docker volume inspect postgres_data

# Volume sil
docker volume rm postgres_data
docker volume prune              # Kullanılmayan volume'ları sil
```

### **NETWORK YÖNETİMİ**
```bash
# Network listele
docker network ls

# Network detayları
docker network inspect bridge

# Network oluştur
docker network create my-network

# Container'ı network'e bağla
docker run --network my-network postgres:15
```

---

## 🎼 DOCKER COMPOSE KOMUTLARI

### **TEMEL KOMUTLAR**
```bash
# Compose file belirt
docker-compose -f docker-compose.dev.yml up

# Services başlat
docker-compose up                    # Foreground
docker-compose up -d                 # Background (detached)
docker-compose up --build            # Image'ları rebuild et

# Services durdur
docker-compose down                  # Container'ları durdur
docker-compose down -v               # Volume'ları da sil
docker-compose down --rmi all        # Image'ları da sil

# Belirli service çalıştır
docker-compose up postgres           # Sadece postgres
docker-compose up postgres redis     # Postgres + Redis
```

### **SERVICE YÖNETİMİ**
```bash
# Service durumunu kontrol et
docker-compose ps
docker-compose ps postgres

# Service'i restart et
docker-compose restart postgres
docker-compose restart

# Service'i stop/start et
docker-compose stop postgres
docker-compose start postgres

# Service'i rebuild et
docker-compose build postgres
docker-compose up --build postgres
```

### **LOGS & DEBUG**
```bash
# Tüm service log'ları
docker-compose logs
docker-compose logs -f              # Follow

# Belirli service log'ları  
docker-compose logs postgres
docker-compose logs -f postgres --tail 100

# Service'e bağlan
docker-compose exec postgres bash
docker-compose exec postgres psql -U postgres -d location_logging
```

### **SCALE & ENVIRONMENT**
```bash
# Service'i scale et
docker-compose up -d --scale api=3  # 3 tane api container'ı

# Environment değişkenleri
docker-compose --env-file .env.prod up

# Config'i kontrol et
docker-compose config               # YAML syntax check
docker-compose config --services   # Service listesi
```

---

## 🔧 DEBUGGING & TROUBLESHOOTING

### **COMMON PROBLEMS & SOLUTIONS**

#### **Problem: Container çalışmıyor**
```bash
# Adım 1: Status kontrol
docker ps -a

# Adım 2: Log'ları kontrol
docker logs container-name

# Adım 3: Container'a gir  
docker exec -it container-name bash

# Adım 4: Resource check
docker stats
```

#### **Problem: Port çakışması**
```bash
# Hangi port'lar kullanılıyor
netstat -tulpn | grep :5432
lsof -i :5432

# Port değiştir
ports:
  - "5433:5432"  # Host:Container
```

#### **Problem: Volume permission**
```bash
# Permission kontrolü
docker exec -it container-name ls -la /data

# Owner değiştir
docker exec -it container-name chown -R postgres:postgres /data
```

#### **Problem: Network connection**
```bash
# Network kontrol
docker network inspect network-name

# Container'lar aynı network'te mi?
docker inspect container-name | grep NetworkMode

# DNS resolution test
docker exec -it container1 ping container2
```

### **USEFUL DEBUG COMMANDS**
```bash
# System info
docker system df              # Disk kullanımı
docker system info           # Docker info
docker system prune          # Temizlik

# Performance monitoring
docker stats                 # Canlı resource monitoring
docker top container-name    # Process listesi

# Health check
docker inspect container-name | grep Health -A 10
```

---

## 🏭 PRODUCTION BEST PRACTICES

### **SECURITY**
```yaml
# Port exposure minimize et
services:
  postgres:
    # ports: KAPALI         # Sadece internal network
    networks:
      - internal

  app:
    ports:
      - "3000:3000"         # Sadece gerekli port'lar
```

### **RESOURCE LIMITS**
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'       # CPU limit
          memory: 512M      # Memory limit
        reservations:
          memory: 256M      # Guaranteed memory
```

### **RESTART POLICIES**
```yaml
services:
  postgres:
    restart: unless-stopped  # En güvenli
    # restart: always        # Her zaman restart
    # restart: on-failure    # Sadece hata durumunda
```

### **HEALTH CHECKS**
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### **LOGGING**
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🎯 PROJEMİZDEKİ KOMUTLAR

### **Development Mode**
```bash
# Development stack başlat
docker-compose -f docker-compose.dev.yml up -d

# Log'ları izle
docker-compose -f docker-compose.dev.yml logs -f

# Database'e bağlan
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d location_logging

# Redis'e bağlan
docker-compose -f docker-compose.dev.yml exec redis redis-cli

# Everything durdur
docker-compose -f docker-compose.dev.yml down
```

### **Production Mode**
```bash
# Production stack başlat  
docker-compose up -d

# Health check
docker-compose ps

# Scale app
docker-compose up -d --scale app=3

# Update & restart
docker-compose pull
docker-compose up -d

# Maintenance mode
docker-compose stop app
docker-compose start app
```

### **Maintenance Commands**
```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres location_logging > backup.sql

# Database restore
docker-compose exec -T postgres psql -U postgres location_logging < backup.sql

# Clean unused resources
docker system prune -a

# Monitor resource usage
docker-compose exec postgres du -sh /var/lib/postgresql/data
```

---

## 🚨 EMERGENCY COMMANDS

### **HIZLI TEMİZLİK**
```bash
# Tüm container'ları durdur
docker stop $(docker ps -q)

# Tüm container'ları sil  
docker rm $(docker ps -aq)

# Kullanılmayan image'ları sil
docker image prune -a

# Her şeyi temizle (DİKKAT!)
docker system prune -a --volumes
```

### **HIZLI RESTART**
```bash
# Compose restart
docker-compose restart

# Belirli service restart
docker-compose restart postgres

# Hard restart
docker-compose down && docker-compose up -d
```

---

## 💡 PRATIK İPUÇLARI

1. **Always use specific tags**: `postgres:15` not `postgres:latest`
2. **Use .dockerignore**: Exclude unnecessary files
3. **Multi-stage builds**: Optimize image size
4. **Named volumes**: Better than bind mounts for data
5. **Health checks**: Monitor container health
6. **Resource limits**: Prevent resource exhaustion
7. **Backup strategy**: Regular database backups
8. **Log rotation**: Prevent disk full
9. **Security scanning**: `docker scan image-name`
10. **Environment variables**: Never hardcode secrets

---

**Bu cheat sheet'i bookmark'la! Docker konusunda tüm ihtiyacın burada! 🔖** 