(function(){
  // prefers-reduced-motion gate
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reducedMotion(){ return !!motionQuery.matches; }

  // ---- SMS thread: staged reveal, typing indicators, re-arms on scroll re-entry ----
  var thread = document.getElementById('thread');
  var bubbles = Array.prototype.slice.call(thread.querySelectorAll('.bubble'));
  var typers = { 1: document.getElementById('typing1'), 2: document.getElementById('typing2') };
  var replayBtn = document.getElementById('replayBtn');
  var timers = [];
  var playing = false;

  function clearTimers(){ timers.forEach(function(t){ clearTimeout(t); }); timers = []; }

  function resetThread(){
    bubbles.forEach(function(b){ b.classList.remove('show'); });
    Object.keys(typers).forEach(function(k){ typers[k].classList.remove('show'); });
  }

  function showThreadFinal(){
    clearTimers();
    playing = false;
    bubbles.forEach(function(b){ b.classList.add('show'); });
    Object.keys(typers).forEach(function(k){ typers[k].classList.remove('show'); });
  }

  function playThread(){
    if (reducedMotion()){ showThreadFinal(); return; }
    if (playing) return;
    playing = true;
    clearTimers();
    resetThread();
    // 4 bubbles: caller, AI, caller, AI
    // typing1 appears before bubble[1] (AI), typing2 appears before bubble[3] (AI)
    var seq = [
      { t: 200,  action: function(){ bubbles[0].classList.add('show'); } },
      { t: 920,  action: function(){ typers[1].classList.add('show'); } },
      { t: 1900, action: function(){ typers[1].classList.remove('show'); bubbles[1].classList.add('show'); } },
      { t: 2700, action: function(){ bubbles[2].classList.add('show'); } },
      { t: 3300, action: function(){ typers[2].classList.add('show'); } },
      { t: 4320, action: function(){ typers[2].classList.remove('show'); bubbles[3].classList.add('show'); playing = false; } }
    ];
    seq.forEach(function(step){ timers.push(setTimeout(step.action, step.t)); });
  }

  replayBtn.addEventListener('click', function(){
    replayBtn.classList.add('spin');
    setTimeout(function(){ replayBtn.classList.remove('spin'); }, 520);
    playThread();
  });

  // IntersectionObserver: re-arms on scroll re-entry (threshold 0.2 per spec)
  if ('IntersectionObserver' in window){
    var demoIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          playThread();
        } else if (!reducedMotion()){
          // left viewport: cancel in-flight, reset so re-entry starts clean
          clearTimers();
          playing = false;
          resetThread();
        }
      });
    }, { threshold: 0.2 });
    demoIO.observe(thread);
  } else {
    playThread();
  }

  // ---- Reveal-on-scroll for sections (fires once, never hides) ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function(el){ revealIO.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('visible'); });
  }

  // ---- Animated stat counter: $450, generation token prevents stale loops ----
  // Source: https://www.angi.com/articles/how-much-does-emergency-plumber-cost.htm
  var STAT_TARGET = 450;
  var statEl = document.getElementById('statNumber');
  var statReplayBtn = document.getElementById('statReplayBtn');
  var countRun = 0;

  function showStatFinal(){
    countRun++;
    if (statEl) statEl.textContent = '$' + STAT_TARGET;
  }

  function runCount(){
    if (reducedMotion()){ showStatFinal(); return; }
    var runId = ++countRun;
    var dur = 1300;
    var start = null;
    function step(ts){
      if (runId !== countRun) return; // generation token: superseded run, stop
      if (!start) start = ts;
      var progress = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = Math.round(eased * STAT_TARGET);
      if (statEl) statEl.textContent = '$' + val;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (reducedMotion()){ showStatFinal(); }

  if (statEl && 'IntersectionObserver' in window){
    var statIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ runCount(); }
      });
    }, { threshold: 0.38 });
    statIO.observe(statEl);
  }

  if (statReplayBtn){
    statReplayBtn.addEventListener('click', function(){
      statReplayBtn.classList.add('spin');
      setTimeout(function(){ statReplayBtn.classList.remove('spin'); }, 520);
      runCount();
    });
  }

  // Mid-session: if user turns on reduced-motion while page is open, snap to final states
  if (motionQuery.addEventListener){
    motionQuery.addEventListener('change', function(){
      if (reducedMotion()){ showStatFinal(); showThreadFinal(); }
    });
  }

  // ---- A1: mobile sticky CTA bar -- hide while real CTA is in view ----
  var stickyCta = document.getElementById('stickyCta');
  var ctaPanel = document.getElementById('ctaPanel');
  if (stickyCta && ctaPanel && 'IntersectionObserver' in window){
    setTimeout(function(){ stickyCta.classList.remove('hide'); }, 800);
    var ctaIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          stickyCta.classList.add('hide');
        } else {
          stickyCta.classList.remove('hide');
        }
      });
    }, { threshold: 0.2 });
    ctaIO.observe(ctaPanel);
  }

})();

(function () {
  var BUBBLE_ID = 'ultra-fast-widget-bubble-54722168';
  var KEY = 'aidDemoWidgetAutoOpened';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) { userTouched = true; }
  }, true);
  var tries = 0;
  var t = setInterval(function () {
    tries += 1;
    var b = document.getElementById(BUBBLE_ID);
    if (b && tries >= 7) {
      clearInterval(t);
      if (!userTouched) { b.click(); }
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }
    if (tries > 30) { clearInterval(t); }
  }, 1000);
})();
// ── 7/16 sequencer contract override (patched 2026-07-21) ──
// play at ~15% visible; re-arm ONLY after full viewport exit; replay hard-resets.
;(function(){
  // Locate the SMS thread element (try common IDs in priority order)
  var threadIds = ['thread','thread-mobile','thread-desktop','sms-thread','sms-thread-desktop','demo-thread'];
  var threadEl = null;
  for (var _i = 0; _i < threadIds.length; _i++){
    threadEl = document.getElementById(threadIds[_i]);
    if (threadEl) break;
  }
  if (!threadEl) return; // no thread found — bail

  // Locate replay buttons (use the FIRST one if multiple)
  var replayBtns = Array.prototype.slice.call(document.querySelectorAll('[id*="replay"],[data-replay]'));

  function hardReset(){
    // Simulate a replay button click to let the existing implementation reset+play.
    // If no replay button exists, try firing a custom event the sequencer may listen for.
    if (replayBtns.length > 0){ replayBtns[0].click(); }
  }

  var _armed = true;
  function _autoplay(){
    if (!_armed) return;
    _armed = false;
    hardReset();
  }

  // playIO: fires when >= 15% of the thread is visible
  var playIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting && e.intersectionRatio >= 0.15){ _autoplay(); }
    });
  }, { threshold: 0.18 });
  playIO.observe(threadEl);

  // rearmIO: fires when thread fully exits the viewport (threshold:0 + !isIntersecting)
  var rearmIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting){ _armed = true; }
    });
  }, { threshold: 0 });
  rearmIO.observe(threadEl);

  // Check already-visible case at init time
  var _rect = threadEl.getBoundingClientRect();
  var _vh = window.innerHeight || document.documentElement.clientHeight;
  var _vis = Math.min(_rect.bottom, _vh) - Math.max(_rect.top, 0);
  if (_rect.height > 0 && _vis / _rect.height >= 0.15){ _autoplay(); }
})();
