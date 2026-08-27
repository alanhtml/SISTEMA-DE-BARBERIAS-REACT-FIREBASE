# ⚜️ Barber System - Operations Hub & Espejo Virtual ⚜️

![Version](https://img.shields.io/badge/Version-1.0.0--Pro-gold)
![React](https://img.shields.io/badge/React-19-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

Sistema integral de gestión de barberías de alta gama, diseñado para fusionar la tecnología de análisis facial por IA con una administración operativa robusta. El proyecto está optimizado para 2026, con estándares estricto de persistencia y una interfaz **Luxury Gold**.

---

## 🚀 Características Principales

### 🪞 Espejo Virtual (IA Face Analysis)
*   **Análisis Morfológico**: Identificación automatizada de tipos de rostro y sugerencias de corte basadas en rasgos faciales.
*   **Interfaz Premium**: Modal de comparación con slider invisible y feedback visual de alta calidad.
*   **Integración CRM**: Los resultados del análisis se guardan directamente en la ficha técnica del cliente para consulta del barbero.

### 🏢 Operations Hub
*   **Gestión de Clientes**: CRM avanzado con historial de servicios y preferencias estéticas.
*   **Control Financiero**: Normalización estricta de datos entre plataformas (Móvil/Web) para evitar discrepancias en precios y contadores.
*   **Dashboard Luxury**: Diseño responsivo bajo la paleta `#d4af37` (Luxury Gold) para una experiencia de usuario exclusiva.

### 🛠️ Arquitectura y Seguridad
*   **Persistencia Blindada**: Capa de normalización `normalizeForFirestore` que convierte tipos de datos dinámicos a formatos estables.
*   **Seguridad de Secretos**: Implementación rigurosa de variables de entorno para proteger API Keys de Firebase y Groq.
*   **Sincronización Total**: Historial de Git saneado y optimizado para despliegues rápidos.

---

## 🛠️ Stack Tecnológico

*   **Frontend**: React 19 + Vite 8
*   **Estilos**: Tailwind CSS 4 + Framer Motion (Animaciones)
*   **Backend/Database**: Firebase (Firestore, Realtime Database, Auth, Storage)
*   **IA**: Integración con Groq API para análisis facial dinámico.
*   **Utilidades**: React Router DOM, React Parallax Tilt.

---

## 📦 Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/alanhtml/SISTEMA-DE-BARBERIAS-REACT-FIREBASE.git
    cd barbersistem
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto con las siguientes claves (basadas en `src/firebase/config.js`):
    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
    VITE_FIREBASE_DATABASE_URL=tu_database_url
    VITE_FIREBASE_PROJECT_ID=tu_project_id
    VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📐 Estructura de Datos y Normalización

El proyecto utiliza un controlador centralizado (`useBarberController.js`) que garantiza que los datos escritos desde dispositivos Android (donde los inputs pueden llegar como String) se transformen a los tipos correctos en Firestore:

*   **Precios**: `String` -> `Number`
*   **Contadores**: `String` -> `Number`
*   **Fechas**: ISO 8601 (Bolivia UTC-4)

---

## 🛡️ Seguridad

Este repositorio **no contiene secretos**. Las claves de API están protegidas mediante el archivo `.env` el cual está excluido del control de versiones vía `.gitignore`. Si detectas alguna vulnerabilidad, por favor reportarla de inmediato.

---

## 📅 Roadmap 2026

- [x] Blindaje de persistencia de datos.
- [x] Evolución estética del Espejo Virtual.
- [ ] Pruebas de rendimiento en dispositivos Android de gama baja.
- [ ] Validación de indexación SEO y metadatos 2026.

---

**Desarrollado por [Alan]** - *Proyecto Académico UNIFRANZ / Profesional 2026*
