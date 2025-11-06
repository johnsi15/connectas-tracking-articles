# Sistema de Tracking de Artículos - Connectas

Este proyecto implementa un sistema de tracking para artículos sindicados de Connectas, permitiendo medir el alcance total de las publicaciones en sitios aliados mediante Google Analytics.

## 📋 Descripción

El sistema consta de un script JavaScript (`connectas-analytics.js`) que los medios aliados pueden integrar fácilmente en sus páginas para rastrear vistas de artículos de Connectas. El script envía eventos personalizados a Google Analytics, capturando datos como el ID del artículo, nombre del medio aliado, URL de embedding, etc.

### Características principales:
- ✅ Integración ultra-simple (solo 1 línea de código)
- ✅ Compatible con cualquier CMS (WordPress, etc.)
- ✅ No interfiere con el Google Analytics del aliado
- ✅ Respeta la privacidad de los usuarios
- ✅ Datos agregados para reportes de impacto

## 🚀 Instalación

1. **Subir el script al servidor:**
   - Coloca `connectas-analytics.js` en tu servidor web (ej: `https://www.connectas.org/analytics.js`)
   - Asegúrate de que sea accesible vía HTTPS

2. **Configurar Google Analytics:**
   - Obtén tu Measurement ID de GA4 (formato: `G-XXXXXXXXXX`)
   - Reemplaza `GA_MEASUREMENT_ID` en el script con tu ID real

3. **Crear dimensiones personalizadas en GA4:**
   - Ve a GA4 > Admin > Custom Definitions
   - Crea las siguientes dimensiones:
     - `article_id`
     - `partner_name`
     - `embed_url`

## 📖 Uso

### Para medios aliados:

Los aliados solo necesitan copiar y pegar esta línea en el `<head>` de su página HTML:

```html
<script src="https://www.connectas.org/analytics.js?article=[ARTICLE_ID]&partner=[NOMBRE_MEDIO]" async></script>
```

**Parámetros:**
- `article=[ARTICLE_ID]`: ID único del artículo (ya configurado por Connectas)
- `partner=[NOMBRE_MEDIO]`: Nombre del medio aliado (reemplazar espacios con `%20`)

**Ejemplo:**
```html
<script src="https://www.connectas.org/analytics.js?article=trump-derechos-humanos-2024&partner=Efecto%20Cocuyo" async></script>
```

### Implementación en diferentes plataformas:

- **WordPress:** Agregar en Custom HTML del post/página
- **Otros CMS:** En la sección de scripts personalizados
- **Sitios estáticos:** Directamente en el `<head>` del HTML

## 📊 Reportes en Google Analytics

### Eventos en tiempo real:
- Nombre del evento: `syndicated_article_view`
- Parámetros: `article_id`, `partner_name`, `embed_url`, etc.

### Reportes personalizados:
Puedes crear reportes como:
```
Vistas por Artículo Sindicado:
├─ trump-derechos-humanos: 15,234 vistas
│  ├─ Efecto Cocuyo: 8,500
│  ├─ El Tiempo: 4,200
│  └─ El Espectador: 2,534
```

## 📁 Estructura del proyecto

- `connectas-analytics.js`: Script principal de tracking
- `doc.html`: Documentación técnica y ejemplos de uso
- `email-aliados.md`: Plantilla de email para comunicar con aliados
- `index.html`: Página de referencia con ejemplos

## ❓ Preguntas Frecuentes

**¿Dónde va exactamente el código?**
En el `<head>` de la página HTML, antes del cierre `</head>`.

**¿Afecta la carga de la página?**
No. El script es asíncrono y muy ligero (~2KB).

**¿Interfiere con nuestro Google Analytics?**
No. Solo envía datos al GA de Connectas.

**¿Es compatible con ad blockers?**
Sí, en la mayoría de los casos.

**¿Necesitamos hacer algo más?**
No, solo pegar la línea. El resto es automático.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: me@johnserrano.co
- WhatsApp: +57 320 8893833

## 🤝 Contribución

Este proyecto es mantenido por el equipo de Connectas. Para contribuciones, por favor contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE) - ver el archivo LICENSE para más detalles.