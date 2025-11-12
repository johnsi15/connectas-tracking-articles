/**
 * Connectas Analytics Tracker - Google Analytics Version
 * Envía eventos de vistas desde sitios aliados directamente a GA de Connectas
 * Versión: 1.2.0
 */
;(function (window, document) {
  'use strict'

  var NAMESPACE = '_connectas_analytics'
  const VERSION = '1.2.0'

  var GA_MEASUREMENT_ID = 'G-P2MB746CNJ' // ID GA4 de Connectas

  if (window[NAMESPACE]) return

  var config = {
    debug: true, // Desactivar cuando esté en producción
    gaLoaded: false,
  }

  var data = {}
  var commandQueue = []

  /**
   * Leer parámetros de la URL del script
   */
  function getScriptParams() {
    const scripts = document.getElementsByTagName('script')
    let currentScript = null

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('connectas-analytics.js') !== -1) {
        currentScript = scripts[i]
        break
      }
    }

    if (!currentScript || !currentScript.src) {
      console.warn('Connectas Analytics: No se pudo detectar el script de connectas-analytics')
      return null
    }

    try {
      var scriptUrl = new URL(currentScript.src)
      var articleId = scriptUrl.searchParams.get('article')
      var partnerName = scriptUrl.searchParams.get('partner')

      if (config.debug) {
        console.log('Connectas Analytics: Parámetros detectados', {
          article: articleId,
          partner: partnerName,
          scriptUrl: currentScript.src,
          version: VERSION,
        })
      }

      return {
        articleId: articleId,
        partnerName: partnerName,
      }
    } catch (e) {
      console.error('Connectas Analytics: Error al parsear URL del script', e)
      return null
    }
  }

  /**
   * Cargar Google Analytics si no está presente
   */
  function loadGoogleAnalytics() {
    if (window.gtag) {
      config.gaLoaded = true
      return
    }

    // Cargar gtag.js
    var script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID
    document.head.appendChild(script)

    // Inicializar gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())

    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // No enviar pageview automático
      cookie_flags: 'SameSite=None;Secure',
      cookie_domain: 'auto',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })

    config.gaLoaded = true

    if (config.debug) {
      console.log('Connectas Analytics: Google Analytics loaded')
    }
  }

  /**
   * Handlers para comandos
   */
  var handlers = {
    setArticle: function (articleData) {
      data.article = articleData
      if (config.debug) {
        console.log('Connectas Analytics: Article set', articleData)
      }
    },

    setPartner: function (partnerName, partnerUrl) {
      data.partner = {
        name: partnerName,
        url: partnerUrl || window.location.hostname,
      }
      if (config.debug) {
        console.log('Connectas Analytics: Partner set', data.partner)
      }
    },

    trackPageView: function () {
      if (!data.article || !data.article.id) {
        console.error('Connectas Analytics: setArticle() must be called before trackPageView()')
        return
      }

      if (!config.gaLoaded) {
        loadGoogleAnalytics()

        setTimeout(function () {
          sendToGA()
        }, 1000)
      } else {
        sendToGA()
      }
    },

    setDebug: function (enabled) {
      config.debug = !!enabled
    },
  }

  /**
   * Enviar evento a Google Analytics
   */
  function sendToGA() {
    if (!window.gtag) {
      console.error('Connectas Analytics: Google Analytics not loaded')
      return
    }

    const eventParams = {
      article_id: data.article.id,
      partner_name: data.partner ? data.partner.name : 'unknown',
      embed_url: window.location.href,
      // Parámetros estándar de GA
      page_referrer: document.referrer,
      page_title: document.title,
      transport_type: 'beacon',
    }

    // Agregar tags si existen
    if (data.article.tags && data.article.tags.length > 0) {
      eventParams.article_tags = data.article.tags.join(',')
    }

    // Enviar evento personalizado a GA
    window.gtag('event', 'syndicated_article_view', eventParams)

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer,
    })

    if (config.debug) {
      console.log('Connectas Analytics: Event sent to GA', eventParams)
    }
  }

  /**
   * Función principal
   */
  function connectasAnalytics() {
    var args = Array.prototype.slice.call(arguments)
    var command = args.shift()

    if (typeof handlers[command] === 'function') {
      handlers[command].apply(null, args)
    } else {
      console.warn('Connectas Analytics: Unknown command "' + command + '"')
    }
  }

  /**
   * Procesar queue
   */
  function processQueue() {
    if (window[NAMESPACE + '_q']) {
      commandQueue = window[NAMESPACE + '_q']
      while (commandQueue.length > 0) {
        var args = commandQueue.shift()
        connectasAnalytics.apply(null, args)
      }
    }
  }

  // Exponer API
  window[NAMESPACE] = connectasAnalytics

  // Procesar comandos que se llamaron antes de cargar
  processQueue()

  // AUTO-INICIALIZACIÓN: Leer parámetros y trackear automáticamente
  const params = getScriptParams()

  if (params && params.articleId) {
    if (config.debug) {
      console.log('Connectas Analytics: Modo automático activado')
    }

    // Configurar artículo
    data.article = {
      id: params.articleId,
      title: document.title,
      url: window.location.href,
    }

    // Configurar partner
    if (params.partnerName) {
      data.partner = {
        name: decodeURIComponent(params.partnerName),
        url: window.location.hostname,
      }
    }

    // Cargar GA y enviar evento automáticamente
    loadGoogleAnalytics()

    // Esperar a que cargue GA y enviar evento
    setTimeout(function () {
      sendToGA()
    }, 1500)
  } else {
    if (config.debug) {
      console.log('Connectas Analytics: Modo manual - esperando comandos')
    }
  }
})(window, document)
