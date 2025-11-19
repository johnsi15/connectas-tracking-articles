/**
 * Connectas Analytics Tracker - Google Analytics Version
 * Envía eventos de vistas desde sitios aliados directamente a GA de Connectas
 * Versión: 1.3.0
 */
;(function (window, document) {
  'use strict'

  var NAMESPACE = '_connectas_analytics'
  const VERSION = '1.3.0'

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
   * Retrocompatible: detecta partner desde parámetros URL o desde dominio
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
      const scriptUrl = new URL(currentScript.src)
      const partnerFromParams = scriptUrl.searchParams.get('partner')

      const currentDomain = window.location.host || window.location.hostname
      const partnerName = partnerFromParams
        ? decodeURIComponent(partnerFromParams)
        : getPartnerNameFromDomain(currentDomain)

      if (config.debug) {
        console.log('Connectas Analytics: Parámetros detectados', {
          partner: partnerName,
          source: partnerFromParams ? 'URL params' : 'domain',
          scriptUrl: currentScript.src,
          version: VERSION,
        })
      }

      return {
        partnerName: partnerName,
      }
    } catch (e) {
      console.error('Connectas Analytics: Error al parsear URL del script', e)
      return null
    }
  }

  /**
   * Extraer nombre del partner desde el dominio
   * Quita www, puerto y extensión (.com, .co, .org, etc)
   */
  function getPartnerNameFromDomain(domain) {
    if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
      return 'Testing'
    }

    if (domain.includes('netlify.app')) {
      // Para netlify: tomar el subdominio (ej: connectas-test.netlify.app -> connectas-test)
      const subdomain = domain.split('.')[0]
      return subdomain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Limpiar dominio: quitar www y puerto
    let cleanDomain = domain.replace(/^www\./, '').split(':')[0]

    // Quitar extensiones comunes (.com, .co, .org, .net, .com.ni, etc)
    cleanDomain = cleanDomain.replace(/\.(com|co|org|net|edu|gov|io)(\.[a-z]{2})*$/i, '')

    const partnerName = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1)

    if (config.debug) {
      console.log('Connectas Analytics: Partner extraído del dominio:', partnerName)
    }

    return partnerName
  }

  /**
   * Cargar Google Analytics si no está presente
   */
  function loadGoogleAnalytics() {
    const hadDataLayer = !!window.dataLayer
    const hadGtag = !!window.gtag

    window.dataLayer = window.dataLayer || []

    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments)
      }
    }

    window.gtag('js', new Date())

    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      cookie_flags: 'SameSite=None;Secure',
      cookie_domain: 'auto',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })

    const existingGtagScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]')

    if (!existingGtagScript) {
      var script = document.createElement('script')
      script.async = true
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID

      script.onload = function () {
        if (config.debug) {
          console.log('Connectas Analytics: gtag.js script loaded')
        }
      }

      document.head.appendChild(script)
    }

    config.gaLoaded = true

    if (config.debug) {
      console.log('Connectas Analytics: Google Analytics loaded')
      console.log('  - Measurement ID:', GA_MEASUREMENT_ID)
      console.log('  - dataLayer existía:', hadDataLayer)
      console.log('  - gtag existía:', hadGtag)
      console.log('  - gtag script existía:', !!existingGtagScript)
      console.log('  - Script nuevo cargado:', !existingGtagScript)
    }
  }

  /**
   * Handlers para comandos
   */
  var handlers = {
    setArticle: function (articleData) {
      data.article = {
        id: articleData.id || window.location.pathname || 'unknown',
        title: articleData.title || document.title,
        url: articleData.url || window.location.href,
        tags: articleData.tags || [],
      }

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
    window.gtag('event', 'syndicated_article_view', {
      send_to: GA_MEASUREMENT_ID,
      ...eventParams,
    })

    window.gtag('event', 'page_view', {
      send_to: GA_MEASUREMENT_ID,
      page_location: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer,
    })

    if (config.debug) {
      console.log('Connectas Analytics: Event sent to GA', eventParams)
      console.log('Connectas Analytics: Target GA4:', GA_MEASUREMENT_ID)
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

  // AUTO-INICIALIZACIÓN: Detectar partner y trackear automáticamente
  const params = getScriptParams()

  if (config.debug) {
    console.log('Connectas Analytics: Modo automático activado')
  }

  if (params && params.partnerName) {
    // Configurar artículo
    data.article = {
      id: window.location.pathname || 'unknown',
      title: document.title,
      url: window.location.href,
    }

    data.partner = {
      name: params.partnerName,
      url: window.location.hostname,
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
