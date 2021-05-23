
// much of the code below is from here https://github.com/berkerol/typer/
// the license: https://github.com/berkerol/typer/blob/master/LICENSE
// the copyright for much of the code in this file likely belongs to https://github.com/berkerol Berk Erol though I could not find explicit copyright info in the repository


/*!
 * FPSMeter 0.3.1 - 9th May 2013
 * https://github.com/Darsain/fpsmeter
 *
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 */
 
/* not used */

export var initCanvas = function() {
    
  ;(function (w, undefined) {
    
    'use strict';
    
    /**
     * Create a new element.
     *
     * @param  {String} name Element type name.
     *
     * @return {Element}
     */
    function newEl(name) {
      return document.createElement(name);
    }

    /**
     * Apply theme CSS properties to element.
     *
     * @param  {Element} element DOM element.
     * @param  {Object}  theme   Theme object.
     *
     * @return {Element}
     */
    function applyTheme(element, theme) {
      for (var name in theme) {
        try {
          element.style[name] = theme[name];
        } catch (e) {}
      }
      
      try {
          element.style.opacity = 0.7;
        } catch (e) {}
      return element;
    }

    /**
     * Return type of the value.
     *
     * @param  {Mixed} value
     *
     * @return {String}
     */
    function type(value) {
      if (value == null) {
        return String(value);
      }

      if (typeof value === 'object' || typeof value === 'function') {
        return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || 'object';
      }

      return typeof value;
    }

    /**
     * Check whether the value is in an array.
     *
     * @param  {Mixed} value
     * @param  {Array} array
     *
     * @return {Integer} Array index or -1 when not found.
     */
    function inArray(value, array) {
      if (type(array) !== 'array') {
        return -1;
      }
      if (array.indexOf) {
        return array.indexOf(value);
      }
      for (var i = 0, l = array.length; i < l; i++) {
        if (array[i] === value) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Poor man's deep object extend.
     *
     * Example:
     *   extend({}, defaults, options);
     *
     * @return {Void}
     */
    function extend() {
      var args = arguments;
      for (var key in args[1]) {
        if (args[1].hasOwnProperty(key)) {
          switch (type(args[1][key])) {
            case 'object':
              args[0][key] = extend({}, args[0][key], args[1][key]); 
              break;

            case 'array':
              args[0][key] = args[1][key].slice(0);
              break;

            default:
              args[0][key] = args[1][key];
          }
        }
      }
      return args.length > 2 ?
        extend.apply(null, [args[0]].concat(Array.prototype.slice.call(args, 2))) :
        args[0];
    }

    /**
     * Convert HSL color to HEX string.
     *
     * @param  {Array} hsl Array with [hue, saturation, lightness].
     *
     * @return {Array} Array with [red, green, blue].
     */
    function hslToHex(h, s, l) {
      var r, g, b;
      var v, min, sv, sextant, fract, vsf;

      if (l <= 0.5) {
        v = l * (1 + s);
      } else {
        v = l + s - l * s;
      }

      if (v === 0) {
        return '#000';
      } else {
        min = 2 * l - v;
        sv = (v - min) / v;
        h = 6 * h;
        sextant = Math.floor(h);
        fract = h - sextant;
        vsf = v * sv * fract;
        if (sextant === 0 || sextant === 6) {
          r = v;
          g = min + vsf;
          b = min;
        } else if (sextant === 1) {
          r = v - vsf;
          g = v;
          b = min;
        } else if (sextant === 2) {
          r = min;
          g = v;
          b = min + vsf;
        } else if (sextant === 3) {
          r = min;
          g = v - vsf;
          b = v;
        } else if (sextant === 4) {
          r = min + vsf;
          g = min;
          b = v;
        } else {
          r = v;
          g = min;
          b = v - vsf;
        }
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }
    }

    /**
     * Helper function for hslToHex.
     */
    function componentToHex(c) {
      c = Math.round(c * 255).toString(16);
      return c.length === 1 ? '0' + c : c;
    }

    /**
     * Manage element event listeners.
     *
     * @param  {Node}     element
     * @param  {Event}    eventName
     * @param  {Function} handler
     * @param  {Bool}     remove
     *
     * @return {Void}
     */
    function listener(element, eventName, handler, remove) {
      if (element.addEventListener) {
        element[remove ? 'removeEventListener' : 'addEventListener'](eventName, handler, false);
      } else if (element.attachEvent) {
        element[remove ? 'detachEvent' : 'attachEvent']('on' + eventName, handler);
      }
    }

    // Preferred timing funtion
    var getTime;
    (function () {
      var perf = w.performance;
      if (perf && (perf.now || perf.webkitNow)) {
        var perfNow = perf.now ? 'now' : 'webkitNow';
        getTime = perf[perfNow].bind(perf);
      } else {
        getTime = function () {
          return +new Date();
        };
      }
    }());

    // Local WindowAnimationTiming interface polyfill
    var cAF = w.cancelAnimationFrame || w.cancelRequestAnimationFrame;
    var rAF = w.requestAnimationFrame;
    (function () {
      var vendors = ['moz', 'webkit', 'o'];
      var lastTime = 0;

      // For a more accurate WindowAnimationTiming interface implementation, ditch the native
      // requestAnimationFrame when cancelAnimationFrame is not present (older versions of Firefox)
      for (var i = 0, l = vendors.length; i < l && !cAF; ++i) {
        cAF = w[vendors[i]+'CancelAnimationFrame'] || w[vendors[i]+'CancelRequestAnimationFrame'];
        rAF = cAF && w[vendors[i]+'RequestAnimationFrame'];
      }

      if (!cAF) {
        rAF = function (callback) {
          var currTime = getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          lastTime = currTime + timeToCall;
          return w.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
        };

        cAF = function (id) {
          clearTimeout(id);
        };
      }
    }());

    // Property name for assigning element text content
    var textProp = type(document.createElement('div').textContent) === 'string' ? 'textContent' : 'innerText';

    /**
     * FPSMeter class.
     *
     * @param {Element} anchor  Element to append the meter to. Default is document.body.
     * @param {Object}  options Object with options.
     */
    
    function FPSMeter(anchor, options) {
      // Optional arguments
      if (type(anchor) === 'object' && anchor.nodeType === undefined) {
        options = anchor;
        anchor = document.body;
      }
      if (!anchor) {
        anchor = document.body;
      }

      // Private properties
      var self = this;
      var o = extend({}, FPSMeter.defaults, options || {});

      var el = {};
      var cols = [];
      var theme, heatmaps;
      var heatDepth = 100;
      var heating = [];

      var thisFrameTime = 0;
      var frameTime = o.threshold;
      var frameStart = 0;
      var lastLoop = getTime() - frameTime;
      var time;

      var fpsHistory = [];
      var durationHistory = [];

      var frameID, renderID;
      var showFps = o.show === 'fps';
      var graphHeight, count, i, j;

      // Exposed properties
      self.options = o;
      self.fps = 0;
      self.duration = 0;
      self.isPaused = 0;

      /**
       * Tick start for measuring the actual rendering duration.
       *
       * @return {Void}
       */
      self.tickStart = function () {
        frameStart = getTime();
      };

      /**
       * FPS tick.
       *
       * @return {Void}
       */
      self.tick = function () {
        time = getTime();
        thisFrameTime = time - lastLoop;
        frameTime += (thisFrameTime - frameTime) / o.smoothing;
        self.fps = 1000 / frameTime;
        self.duration = frameStart < lastLoop ? frameTime : time - frameStart;
        lastLoop = time;
      };

      /**
       * Pause display rendering.
       *
       * @return {Object} FPSMeter instance.
       */
      self.pause = function () {
        if (frameID) {
          self.isPaused = 1;
          clearTimeout(frameID);
          cAF(frameID);
          cAF(renderID);
          frameID = renderID = 0;
        }
        return self;
      };

      /**
       * Resume display rendering.
       *
       * @return {Object} FPSMeter instance.
       */
      self.resume = function () {
        if (!frameID) {
          self.isPaused = 0;
          requestRender();
        }
        return self;
      };

      /**
       * Update options.
       *
       * @param {String} name  Option name.
       * @param {Mixed}  value New value.
       *
       * @return {Object} FPSMeter instance.
       */
      self.set = function (name, value) {
        o[name] = value;
        showFps = o.show === 'fps';

        // Rebuild or reposition elements when specific option has been updated
        if (inArray(name, rebuilders) !== -1) {
          createMeter();
        }
        if (inArray(name, repositioners) !== -1) {
          positionMeter();
        }
        return self;
      };

      /**
       * Change meter into rendering duration mode.
       *
       * @return {Object} FPSMeter instance.
       */
      self.showDuration = function () {
        self.set('show', 'ms');
        return self;
      };

      /**
       * Change meter into FPS mode.
       *
       * @return {Object} FPSMeter instance.
       */
      self.showFps = function () {
        self.set('show', 'fps');
        return self;
      };

      /**
       * Toggles between show: 'fps' and show: 'duration'.
       *
       * @return {Object} FPSMeter instance.
       */
      self.toggle = function () {
        self.set('show', showFps ? 'ms' : 'fps');
        return self;
      };

      /**
       * Hide the FPSMeter. Also pauses the rendering.
       *
       * @return {Object} FPSMeter instance.
       */
      self.hide = function () {
        self.pause();
        el.container.style.display = 'none';
        return self;
      };

      /**
       * Show the FPSMeter. Also resumes the rendering.
       *
       * @return {Object} FPSMeter instance.
       */
      self.show = function () {
        self.resume();
        el.container.style.display = 'block';
        return self;
      };

      /**
       * Check the current FPS and save it in history.
       *
       * @return {Void}
       */
      function historyTick() {
        for (i = o.history; i--;) {
          fpsHistory[i] = i === 0 ? self.fps : fpsHistory[i-1];
          durationHistory[i] = i === 0 ? self.duration : durationHistory[i-1];
        }
      }

      /**
       * Returns heat hex color based on values passed.
       *
       * @param  {Integer} heatmap
       * @param  {Integer} value
       * @param  {Integer} min
       * @param  {Integer} max
       *
       * @return {Integer}
       */
      function getHeat(heatmap, value, min, max) {
        return heatmaps[0|heatmap][Math.round(Math.min((value - min) / (max - min) * heatDepth, heatDepth))];
      }

      /**
       * Update counter number and legend.
       *
       * @return {Void}
       */
      function updateCounter() {
        // Update legend only when changed
        if (el.legend.fps !== showFps) {
          el.legend.fps = showFps;
          el.legend[textProp] = showFps ? 'FPS' : 'ms';
        }
        // Update counter with a nicely formated & readable number
        count = showFps ? self.fps : self.duration;
        el.count[textProp] = count > 999 ? '999+' : count.toFixed(count > 99 ? 0 : o.decimals);
      }

      /**
       * Render current FPS state.
       *
       * @return {Void}
       */
      function render() {
        time = getTime();
        // If renderer stopped reporting, do a simulated drop to 0 fps
        if (lastLoop < time - o.threshold) {
          self.fps -= self.fps / Math.max(1, o.smoothing * 60 / o.interval);
          self.duration = 1000 / self.fps;
        }

        historyTick();
        updateCounter();

        // Apply heat to elements
        if (o.heat) {
          if (heating.length) {
            for (i = heating.length; i--;) {
              heating[i].el.style[theme[heating[i].name].heatOn] = showFps ?
                getHeat(theme[heating[i].name].heatmap, self.fps, 0, o.maxFps) :
                getHeat(theme[heating[i].name].heatmap, self.duration, o.threshold, 0);
            }
          }

          if (el.graph && theme.column.heatOn) {
            for (i = cols.length; i--;) {
              cols[i].style[theme.column.heatOn] = showFps ?
                getHeat(theme.column.heatmap, fpsHistory[i], 0, o.maxFps) :
                getHeat(theme.column.heatmap, durationHistory[i], o.threshold, 0);
            }
          }
        }

        // Update graph columns height
        if (el.graph) {
          for (j = 0; j < o.history; j++) {
            cols[j].style.height = (showFps ?
              (fpsHistory[j] ? Math.round(graphHeight / o.maxFps * Math.min(fpsHistory[j], o.maxFps)) : 0) :
              (durationHistory[j] ? Math.round(graphHeight / o.threshold * Math.min(durationHistory[j], o.threshold)) : 0)
            ) + 'px';
          }
        }
      }

      /**
       * Request rendering loop.
       *
       * @return {Int} Animation frame index.
       */
      function requestRender() {
        if (o.interval < 20) {
          frameID = rAF(requestRender);
          render();
        } else {
          frameID = setTimeout(requestRender, o.interval);
          renderID = rAF(render);
        }
      }

      /**
       * Meter events handler.
       *
       * @return {Void}
       */
      function eventHandler(event) {
        event = event || window.event;
        if (event.preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.returnValue = false;
          event.cancelBubble = true;
        }
        self.toggle();
      }

      /**
       * Destroys the current FPSMeter instance.
       *
       * @return {Void}
       */
      self.destroy = function () {
        // Stop rendering
        self.pause();
        // Remove elements
        removeMeter();
        // Stop listening
        self.tick = self.tickStart = function () {};
      };

      /**
       * Remove meter element.
       *
       * @return {Void}
       */
      function removeMeter() {
        // Unbind listeners
        if (o.toggleOn) {
          listener(el.container, o.toggleOn, eventHandler, 1);
        }
        // Detach element
        anchor.removeChild(el.container);
      }

      /**
       * Sets the theme, and generates heatmaps when needed.
       */
      function setTheme() {
        theme = FPSMeter.theme[o.theme];

        // Generate heatmaps
        heatmaps = theme.compiledHeatmaps || [];
        if (!heatmaps.length && theme.heatmaps.length) {
          for (j = 0; j < theme.heatmaps.length; j++) {
            heatmaps[j] = [];
            for (i = 0; i <= heatDepth; i++) {
              heatmaps[j][i] = hslToHex(0.33 / heatDepth * i, theme.heatmaps[j].saturation, theme.heatmaps[j].lightness);
            }
          }
          theme.compiledHeatmaps = heatmaps;
        }
      }

      /**
       * Creates and attaches the meter element.
       *
       * @return {Void}
       */
      function createMeter() {
        // Remove old meter if present
        if (el.container) {
          removeMeter();
        }

        // Set theme
        setTheme();

        // Create elements
        el.container = applyTheme(newEl('div'), theme.container);
        el.count = el.container.appendChild(applyTheme(newEl('div'), theme.count));
        el.legend = el.container.appendChild(applyTheme(newEl('div'), theme.legend));
        el.graph = o.graph ? el.container.appendChild(applyTheme(newEl('div'), theme.graph)) : 0;

        // Add elements to heating array
        heating.length = 0;
        for (var key in el) {
          if (el[key] && theme[key].heatOn) {
            heating.push({
              name: key,
              el: el[key]
            });
          }
        }

        // Graph
        cols.length = 0;
        if (el.graph) {
          // Create graph
          el.graph.style.width = (o.history * theme.column.width + (o.history - 1) * theme.column.spacing) + 'px';

          // Add columns
          for (i = 0; i < o.history; i++) {
            cols[i] = el.graph.appendChild(applyTheme(newEl('div'), theme.column));
            cols[i].style.position = 'fixed';
            cols[i].style.bottom = 5;
            cols[i].style.right = (i * theme.column.width + i * theme.column.spacing) + 'px';
            cols[i].style.width = theme.column.width + 'px';
            cols[i].style.height = '0px';
            
            
          }
        }

        // Set the initial state
        positionMeter();
        updateCounter();

        // Append container to anchor
        anchor.appendChild(el.container);

        // Retrieve graph height after it was appended to DOM
        if (el.graph) {
          graphHeight = el.graph.clientHeight;
        }

        // Add event listeners
        if (o.toggleOn) {
          if (o.toggleOn === 'click') {
            el.container.style.cursor = 'pointer';
          }
          listener(el.container, o.toggleOn, eventHandler);
        }
      }

      /**
       * Positions the meter based on options.
       *
       * @return {Void}
       */
      function positionMeter() {
        applyTheme(el.container, o);
      }

      /**
       * Construct.
       */
      (function () {
        // Create meter element
        createMeter();
        // Start rendering
        requestRender();
      }());
    }

    // Expose the extend function
    FPSMeter.extend = extend;

    // Expose the FPSMeter class
    window.FPSMeter = FPSMeter;

    // Default options
    FPSMeter.defaults = {
      interval:  100,     // Update interval in milliseconds.
      smoothing: 10,      // Spike smoothing strength. 1 means no smoothing.
      show:      'fps',   // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
      toggleOn:  'click', // Toggle between show 'fps' and 'ms' on this event.
      decimals:  1,       // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
      maxFps:    60,      // Max expected FPS value.
      threshold: 100,     // Minimal tick reporting interval in milliseconds.

      // Meter position
      position: 'fixed', // Meter position.
      zIndex:   10,         // Meter Z index.
      left:     '5px',      // Meter left offset.
      top:      'auto',      // Meter top offset.
      right:    'auto',     // Meter right offset.
      bottom:   '12px',     // Meter bottom offset.
      margin:   '0 0 0 0',  // Meter margin. Helps with centering the counter when left: 50%;
      
      
      
      // Theme
      theme: 'transparent', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
      heat:  0,      // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

      // Graph
      graph:   0, // Whether to show history graph.
      history: 20 // How many history states to show in a graph.
    };

    // Option names that trigger FPSMeter rebuild or reposition when modified
    var rebuilders = [
      'toggleOn',
      'theme',
      'heat',
      'graph',
      'history'
    ];
    var repositioners = [
      'position',
      'zIndex',
      'left',
      'top',
      'right',
      'bottom',
      'margin'
    ];
  }(window));

  ;(function (w, FPSMeter, undefined) {
    'use strict';

    // Themes object
    FPSMeter.theme = {};

    // Base theme with layout, no colors
    var base = FPSMeter.theme.base = {
      heatmaps: [],
      container: {
        // Settings
        heatOn: null,
        heatmap: null,

        // Styles
        
        opacity:0.3,
        
        padding: '5px',
        minWidth: '95px',
        height: '30px',
        lineHeight: '30px',
        textAlign: 'right',
        textShadow: 'none'
      },
      count: {
        // Settings
        heatOn: null,
        heatmap: null,

        // Styles
        position: 'fixed',
        bottom: 9,
        right: 5,
        padding: '5px 10px',
        height: '30px',
        fontSize: '24px',
        fontFamily: 'Consolas, Andale Mono, monospace',
        zIndex: 2
      },
      legend: {
        // Settings
        heatOn: null,
        heatmap: null,

        // Styles
        position: 'fixed',
        bottom: 9,
        left: 0,
        padding: '5px 10px',
        height: '30px',
        fontSize: '12px',
        lineHeight: '32px',
        fontFamily: 'sans-serif',
        textAlign: 'left',
        zIndex: 2
      },
      graph: {
        // Settings
        heatOn: null,
        heatmap: null,

        // Styles
        position: 'relative',
        boxSizing: 'padding-box',
        MozBoxSizing: 'padding-box',
        height: '100%',
        zIndex: 1
      },
      column: {
        // Settings
        width: 4,
        spacing: 1,
        heatOn: null,
        heatmap: null
      }
    };

    // Dark theme
    FPSMeter.theme.dark = FPSMeter.extend({}, base, {
      heatmaps: [{
        saturation: 0.8,
        lightness: 0.8
      }],
      container: {
        background: '#222',
        color: '#fff',
        border: '1px solid #1a1a1a',
        textShadow: '1px 1px 0 #222'
      },
      count: {
        heatOn: 'color'
      },
      column: {
        background: '#3f3f3f'
      }
    });

    // Light theme
    FPSMeter.theme.light = FPSMeter.extend({}, base, {
      heatmaps: [{
        saturation: 0.5,
        lightness: 0.5
      }],
      container: {
        color: '#666',
        background: '#fff',
        textShadow: '1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)'
      },
      count: {
        heatOn: 'color'
      },
      column: {
        background: '#eaeaea'
      }
    });

    // Colorful theme
    FPSMeter.theme.colorful = FPSMeter.extend({}, base, {
      heatmaps: [{
        saturation: 0.5,
        lightness: 0.6
      }],
      container: {
        heatOn: 'backgroundColor',
        background: '#888',
        color: '#fff',
        textShadow: '1px 1px 0 rgba(0,0,0,.2)',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)'
      },
      column: {
        background: '#777',
        backgroundColor: 'rgba(0,0,0,.2)'
      }
    });

    // Transparent theme
    FPSMeter.theme.transparent = FPSMeter.extend({}, base, {
      heatmaps: [{
        saturation: 0.8,
        lightness: 0.5
      }],
      container: {
        padding: 0,
        color: '#fff',
        textShadow: '1px 1px 0 rgba(0,0,0,.5)'
      },
      count: {
        padding: '0 5px',
        height: '40px',
        lineHeight: '40px'
      },
      legend: {
        padding: '0 5px',
        height: '40px',
        lineHeight: '42px'
      },
      graph: {
        height: '40px'
      },
      column: {
        width: 5,
        background: '#999',
        heatOn: 'backgroundColor',
        opacity: 0.4
      }
    });
  }(window, FPSMeter));
  

  /* global performance FPSMeter */
  /* eslint-disable no-unused-vars */

  /* original: https://github.com/berkerol/typer
    copyright and license infos:  https://github.com/berkerol/typer/blob/master/LICENSE#L6
   */

  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const getTime = typeof performance === 'function' ? performance.now : Date.now;
  const FRAME_THRESHOLD = 300;
  const FRAME_DURATION = 1000 / 58;
  let then = getTime();
  let acc = 0;
  let animation;
  let gameLoop;
  for (const element of window.document.getElementsByTagName('link')) {
    if (element.href.includes('bootstrap')) {
      FPSMeter.theme.colorful.container.height = '40px';
      break;
    }
  }
  const meter = new FPSMeter({
    left: canvas.width - 130 + 'px',
    top: 'auto',
    bottom: '12px',
    theme: 'colorful',
    heat: 1,
    graph: 1
  });

  const label = {
    font: '24px Arial',
    color: '#0095DD',
    margin: 30,
    left: 20,
    right: canvas.width - 120
  };

  // const addPause = () => {
  //   document.addEventListener('keyup', e => {
  //     if (e.keyCode === 80) {
  //       if (animation === undefined) {
  //         animation = window.requestAnimationFrame(gameLoop);
  //       } else {
  //         window.cancelAnimationFrame(animation);
  //         animation = undefined;
  //       }
  //     }
  //   });
  // };

  const addResize = () => {
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  };

  const loop = gameLogic => {
    const now = getTime();
    const ms = now - then;
    let frames = 0;
    then = now;
    if (ms < FRAME_THRESHOLD) {
      acc += ms;
      while (acc >= FRAME_DURATION) {
        frames++;
        acc -= FRAME_DURATION;
      }
    }
    meter.tick();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameLogic(frames);
    if (gameLoop === undefined) {
      gameLoop = () => {
        loop(gameLogic);
      };
    }
    animation = window.requestAnimationFrame(gameLoop);
  };

  const drawCircle = (x, y, radius) => {
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
  };

  const paintCircle = (x, y, radius, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    drawCircle(x, y, radius);
    ctx.fill();
  };

  const drawLine = (x1, y1, x2, y2) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  };

  const paintLine = (x1, y1, x2, y2, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    drawLine(x1, y1, x2, y2);
    ctx.stroke();
  };

  const drawRoundRect = (x, y, width, height, arcX, arcY) => {
    ctx.moveTo(x + arcX, y);
    ctx.lineTo(x + width - arcX, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + arcY);
    ctx.lineTo(x + width, y + height - arcY);
    ctx.quadraticCurveTo(x + width, y + height, x + width - arcX, y + height);
    ctx.lineTo(x + arcX, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - arcY);
    ctx.lineTo(x, y + arcY);
    ctx.quadraticCurveTo(x, y, x + arcX, y);
  };

  const paintRoundRect = (x, y, width, height, arcX, arcY, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    drawRoundRect(x, y, width, height, arcX, arcY);
    ctx.fill();
  };

  const isIntersectingRectangleWithRectangle = (rect1, width1, height1, rect2, width2, height2) => {
    return rect2.x < rect1.x + width1 && rect2.x + width2 > rect1.x && rect2.y < rect1.y + height1 && rect2.y + height2 > rect1.y;
  };

  const isIntersectingRectangleWithCircle = (rect, width, height, circle, radius) => {
    const distX = Math.abs(circle.x - rect.x - width / 2);
    const distY = Math.abs(circle.y - rect.y - height / 2);
    if (distX > (width / 2 + radius) || distY > (height / 2 + radius)) {
      return false;
    }
    if (distX <= (width / 2) || distY <= (height / 2)) {
      return true;
    }
    const dX = distX - width / 2;
    const dY = distY - height / 2;
    return dX ** 2 + dY ** 2 <= radius ** 2;
  };

  const getDistance = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const generateRandomNumber = (min, max) => {
    return min + Math.random() * (max - min);
  };

  const generateRandomInteger = range => {
    return Math.floor(Math.random() * range);
  };

  const generateRandomRgbColor = () => {
    return [generateRandomInteger(255), generateRandomInteger(255), generateRandomInteger(255)];
  };

  const generateRandomCharCode = (caseSensitive) => {
    const codes = [];
    if (caseSensitive) {
      for (let i = 0; i < 26; i++) {
        codes.push(65 + i);
      }
    }
    for (let i = 0; i < 26; i++) {
      codes.push(97 + i);
    }
    return codes[generateRandomInteger(codes.length)];
  };
  
  console.log("adding animation")
  
  function animationFetch() {
    
    return animation
  }
  
  function animationSet(animationSet) {
    
    animation = animationSet
  }
  
  function gameLoopFetch() {
    
    return gameLoop
  }
  
  return {
    canvas:canvas,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    ctx:ctx,
    meter:meter,
    loop:loop,
    label:label,
    paintCircle:paintCircle,
    
    gameLoopFetch:gameLoopFetch,
    
    generateRandomNumber:generateRandomNumber,
    generateRandomInteger:generateRandomInteger,
    generateRandomCharCode:generateRandomCharCode,
    isIntersectingRectangleWithCircle:isIntersectingRectangleWithCircle,
    animationFetch:animationFetch,
    animationSet:animationSet,
    generateRandomRgbColor:generateRandomRgbColor
  }
  
//   canvas
// ctx
// meter
}