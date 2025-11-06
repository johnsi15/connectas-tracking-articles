# Email Template para Medios Aliados

---

**Asunto:** Código de tracking para el especial "[TÍTULO DEL ESPECIAL]"

---

Hola equipo de **[NOMBRE DEL MEDIO]**,

¡Muchas gracias por su interés en publicar nuestro especial **"[TÍTULO DEL ESPECIAL]"**! 

Para poder contabilizar las vistas que genera su publicación, les pedimos incluir un pequeño código de tracking en la página donde publicarán el contenido.

---

## 📋 Instrucciones (muy simples):

**Solo necesitan copiar y pegar esta línea en el `<head>` de su página:**

```html
<script src="https://www.connectas.org/analytics.js?article=[ARTICLE_ID]&partner=[NOMBRE_MEDIO]" async></script>
```

### Donde:
- `article=[ARTICLE_ID]` → Ya está configurado ✅
- `partner=[NOMBRE_MEDIO]` → **Cambiar por el nombre de su medio**

---

## 📝 Ejemplo para su medio:

```html
<script src="https://www.connectas.org/analytics.js?article=trump-derechos-humanos-2024&partner=Efecto%20Cocuyo" async></script>
```

_Nota: Los espacios en el nombre se reemplazan con `%20`_

---

## ❓ Preguntas Frecuentes

**¿Dónde exactamente va el código?**
En el `<head>` de la página HTML, antes del cierre `</head>`. Si usan WordPress u otro CMS, pueden agregarlo en:
- Custom HTML del post/página
- En la sección "Scripts personalizados"
- Pedirle a su desarrollador que lo agregue al template

**¿Esto afecta la carga de nuestra página?**
No. El script es asíncrono (`async`) y muy ligero (~2KB). No bloquea la carga de la página.

**¿Esto afecta nuestro Google Analytics?**
No. Solo envía datos a nuestro Google Analytics, no interfiere con el suyo.

**¿Es compatible con ad blockers?**
La mayoría de las veces sí funciona, aunque algunos ad blockers muy agresivos podrían bloquearlo.

**¿Necesitamos hacer algo más?**
No, solo pegar el código. El resto es automático.

**¿Tiene costo?**
No, es completamente gratuito para ustedes.

---

## 🎯 ¿Por qué necesitamos esto?

Como parte de nuestro modelo de periodismo colaborativo, medimos el alcance total de nuestros especiales (vistas en nuestro sitio + vistas en sitios aliados). Esto nos ayuda a:
- Demostrar el impacto de las investigaciones
- Reportar a nuestros donantes/financiadores
- Mejorar futuras colaboraciones

Los datos que capturamos son solo agregados (número de vistas por medio), respetando la privacidad de sus usuarios.

---

## 📞 Soporte

Si tienen algún problema o duda, pueden escribirnos a:
- **Email:** [correo@connectas.org]
- **WhatsApp:** [+57 XXX XXX XXXX]

¡Gracias por ser parte de esta red de periodismo colaborativo!

Saludos,  
**Equipo Connectas**

---

### 📎 Adjuntos en este correo:
- `instrucciones-tracking.pdf` (estas mismas instrucciones en PDF)
- `ejemplos.html` (ejemplos de implementación)

---

**P.D.:** Si les resulta más fácil, podemos programar una llamada de 10 minutos para ayudarles a implementarlo. ¡Solo avísennos!