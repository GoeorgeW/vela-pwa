# Vela · Gráficos cripto en vivo (PWA)

App estática, sin build: sube estos archivos tal cual a la raíz del repositorio.

| Archivo | Para qué |
|---|---|
| `index.html` | Toda la app (interfaz, gráfico, WebSockets, indicadores, editor de scripts, simulador) |
| `manifest.json` | Metadatos para instalarla en la pantalla de inicio |
| `sw.js` | Service worker (arranque sin conexión y caché de librerías) |
| `icon-192.png`, `icon-512.png` | Iconos de la app |

## Publicar en GitHub Pages
1. Crea un repositorio y sube los cinco archivos a la raíz.
2. Settings → Pages → Source: "Deploy from a branch" → rama `main`, carpeta `/ (root)`.
3. Abre `https://TU_USUARIO.github.io/TU_REPO/`.

## Instalar en el móvil
- Android (Chrome): botón "Instalar" de la cabecera o menú ⋮ → "Añadir a pantalla de inicio".
- iPhone (Safari): Compartir → "Añadir a pantalla de inicio".

## Actualizar
Al publicar cambios, sube también `sw.js` cambiando `VERSION` (por ejemplo `vela-v2`) para renovar la caché.

## Datos
Precios e histórico vienen de los endpoints públicos de Binance (REST + WebSocket), sin API key.
El paper trading es dinero simulado y se guarda solo en el navegador (localStorage).
