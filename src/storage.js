// Quota-safe localStorage layer. The TTS audio cache (spelloop-audio-*)
// is the only unbounded grower; progress writes must never fail because
// cached audio filled the quota. Audio entries are expendable — evict them.
(function() {
  var AUDIO_PREFIX = 'spelloop-audio-';
  var ORDER_KEY = 'spelloop-audio-order';
  var AUDIO_CAP = 24;

  function audioKeys() {
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(AUDIO_PREFIX) === 0) keys.push(k);
      }
    } catch (e) {}
    return keys;
  }

  function readOrder() {
    try { return JSON.parse(localStorage.getItem(ORDER_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeOrder(order) {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch (e) {}
  }

  // Mark key most-recently-used.
  function touchAudio(key) {
    var order = readOrder().filter(function(k) { return k !== key; });
    order.push(key);
    writeOrder(order);
  }

  // Drop the n least-recently-used audio entries. Entries missing from the
  // order index (cached before this layer existed) count as oldest.
  function evictAudio(n) {
    var order = readOrder();
    var known = {};
    order.forEach(function(k) { known[k] = true; });
    var legacy = audioKeys().filter(function(k) { return !known[k]; });
    var victims = legacy.concat(order).slice(0, n);
    victims.forEach(function(k) { try { localStorage.removeItem(k); } catch (e) {} });
    var dropped = {};
    victims.forEach(function(k) { dropped[k] = true; });
    writeOrder(order.filter(function(k) { return !dropped[k]; }));
    return victims.length;
  }

  // Write a progress-critical key. On quota pressure, sacrifice the audio
  // cache and retry. Returns false only if the write still fails.
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch (e) {
      evictAudio(AUDIO_CAP);
      try { localStorage.setItem(key, value); return true; }
      catch (e2) {
        try { console.warn('Spelloop: storage write failed for', key); } catch (e3) {}
        return false;
      }
    }
  }

  // Cap-aware audio cache write. Never throws, never exceeds AUDIO_CAP.
  function cacheAudio(key, dataUrl) {
    var count = audioKeys().length;
    if (count >= AUDIO_CAP) evictAudio(count - AUDIO_CAP + 1);
    try { localStorage.setItem(key, dataUrl); touchAudio(key); return true; }
    catch (e) {
      evictAudio(Math.ceil(AUDIO_CAP / 2));
      try { localStorage.setItem(key, dataUrl); touchAudio(key); return true; }
      catch (e2) { return false; }
    }
  }

  window.SLStore = { safeSet: safeSet, cacheAudio: cacheAudio, touchAudio: touchAudio };
  window.slSet = safeSet;
})();
