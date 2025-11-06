/**
 * Connectas Analytics Tracker - WordPress + Google Analytics Version
 * Envía eventos de vistas desde sitios aliados directamente a GA de Connectas
 * Versión: 1.0.0
 */
;(function (window, document) {
  'use strict'

  var NAMESPACE = '_connectas_analytics'
  var VERSION = '1.0.0'

  // Tu Measurement ID de Google Analytics 4
  // Los aliados NO necesitan cambiarlo
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX' // Reemplazar con el tuyo

  if (window[NAMESPACE]) return

  var config = {
    debug: false,
    gaLoaded: false,
  }

  var data = {}
  var commandQueue = []

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

    // Configurar GA con cookie_flags para third-party context
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // No enviar pageview automático
      cookie_flags: 'SameSite=None;Secure',
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
        // Esperar un poco a que cargue GA
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

    var eventParams = {
      // Parámetros personalizados
      article_id: data.article.id,
      article_title: data.article.title || '',
      article_url: data.article.url || '',
      partner_name: data.partner ? data.partner.name : 'unknown',
      partner_url: data.partner ? data.partner.url : '',
      embed_url: window.location.href,
      embed_referrer: document.referrer,

      // Parámetros estándar de GA
      page_location: window.location.href,
      page_referrer: document.referrer,
      page_title: document.title,
    }

    // Agregar tags si existen
    if (data.article.tags && data.article.tags.length > 0) {
      eventParams.article_tags = data.article.tags.join(',')
    }

    // Enviar evento personalizado a GA
    window.gtag('event', 'syndicated_article_view', eventParams)

    if (config.debug) {
      console.log('Connectas Analytics: Event sent to GA', eventParams)
    }

    // También enviar como pageview virtual para que aparezca en reportes estándar
    window.gtag('event', 'page_view', {
      page_location: data.article.url, // URL del artículo en Connectas
      page_title: data.article.title + ' (via ' + (data.partner ? data.partner.name : 'partner') + ')',
      page_referrer: window.location.href, // De dónde viene (sitio del aliado)
    })
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
})(window, document)
