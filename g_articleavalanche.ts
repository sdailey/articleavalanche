// much of the code below is from here https://github.com/berkerol/typer/
// the license: https://github.com/berkerol/typer/blob/master/LICENSE
// the copyright for much of the code in this file likely belongs to https://github.com/berkerol Berk Erol though I could not find explicit copyright info in the repository


// declare var canvasObj;

// declare var particleObj;

import { initParticle } from "./v__particle";

import { initCanvas } from "./v_canvas";

/* global canvas ctx animation:writable gameLoop label loop paintCircle isIntersectingRectangleWithCircle generateRandomNumber generateRandomCharCode paintParticles createParticles processParticles */


var runNumber = 0


export var runArticleAvalanche = function(pageWords, gameCommencedHandler) {
  
  let startTimestamp = Date.now()
  
  // declare ctx as window[canvasObjKey].ctx
  
  // var canvas = window[canvasObjKey].canvas;
  
  // var ctx = window[canvasObjKey].ctx;
  
  // var meter = window[canvasObjKey].meter;
  
  // var loop = window[canvasObjKey].loop;
  
  // var label = window[canvasObjKey].label
  
  // let canvasObjKey = "DGS_g_typer__canvasObj";
  var canvasObj = initCanvas()
  
  function softResetRound () {
    // 
    startTimestamp = Date.now();
    
    letters = [];
    
    currentRoundScore = 0;
    
  }
  
  // todo: manage global strings - registering/deregistering/global cleanup, etc
  var gameClosed = false
  function clearGameHandler () {
    pauseToggle()
    
    canvasObj.meter.destroy()
    // canvasObj.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    window.cancelAnimationFrame(canvasObj.animationFetch())
    
    window.cancelAnimationFrame(canvasObj.gameLoopFetch())
    // canvasObj.loop = null;
    
    // canvasObj = {}
    // canvasObj.animationSet(undefined)
    
    softResetRound ()
    
    var interstitialEl = document.getElementById("articleavalanche_interstitial_explainer")
    if (interstitialEl != null) {
      interstitialEl.style.visibility = "hidden"
    }
    gameClosed = true
    // console.log(canvasObj)
  }
  
  // let particleObjKey = "DGS_g_typer__particleObj"
  
  var particleObj = initParticle(canvasObj)
  
  // var generateRandomNumber = window[canvasObjKey].generateRandomInteger
  
  // var generateRandomInteger = window[canvasObjKey].generateRandomInteger
  
  // var generateRandomCharCode = window[canvasObjKey].generateRandomCharCode
  
  // var isIntersectingRectangleWithCircle = window[canvasObjKey].isIntersectingRectangleWithCircle
  
  // var paintCircle = window[canvasObjKey].paintCircle
  
  // var paintParticles = window[particleObjKey].paintParticles
  
  // var createParticles = window[particleObjKey].createParticles
  
  // var processParticles = window[particleObjKey].processParticles
  
  
  
  let score = 0;
  
  let currentRoundScore = 0;
  
  let lives = 2;
  let caseSensitive = true;

  particleObj.paintParticles()
  
  
  let canvas_width = canvasObj.canvas.width;
  let canvas_height = canvasObj.canvas.height;
  
  // console.log("hello there 123!")
  // console.log(canvas_width + canvas_height);
  
  let baseDifficulty = 2200
  
  let screenSpecificDifficulty = (canvas_width + canvas_height)/baseDifficulty
  
  const center = {
    x: canvasObj.canvas.width / 2,
    y: canvasObj.canvas.height / 2,
    radius: 20,
    color: '#00adff'
  };
  
  const letter = {
    font: '25px Monospace',
    color: '#0095DD',
    width: 15,
    height: 20,
    initialHighestSpeed: 1.35 * screenSpecificDifficulty,
    ultimateHighestSpeed: 4.4 * screenSpecificDifficulty,
    lowestSpeed: 0.55 * screenSpecificDifficulty,
    probability: 0.02
  };
  

  let letters = [];

  // canvasObj.ctx.label.font;
  
  letter.width = canvasObj.ctx.measureText('0').width;
  document.addEventListener('keydown', keyDownHandler);
  // document.addEventListener('keyup', keyUpHandler);
  window.addEventListener('resize', resizeHandler);

  
  var wordIndexToFetch = 0
  
  let lastSuccessfullWordAttempt = ""
  let nullUndefinedWordFetchAttempts = 0
  
  function getWord () {
    
    if (wordIndexToFetch == pageWords.length - 1) {
      
      wordIndexToFetch = 0;
    }
    
    var nextWord = pageWords[wordIndexToFetch];
    
    if (wordIndexToFetch >= pageWords.length - 1) {
      
      wordIndexToFetch = 0
    } else {
      
      wordIndexToFetch++
    }
    
    
    if (nextWord == undefined || nextWord == null){
      nullUndefinedWordFetchAttempts++ 
      if (nullUndefinedWordFetchAttempts > 5) {
        console.log("bad")
        console.log(lastSuccessfullWordAttempt)
        return "blob"
      }
      console.log("oops")
      console.log(lastSuccessfullWordAttempt)
      if (wordIndexToFetch >= pageWords.length - 1) {
      
        wordIndexToFetch = 0
      } else {
        
        wordIndexToFetch++
      }
      getWord()
      
    } else {
      
      lastSuccessfullWordAttempt = nextWord
      
      return nextWord
    }
    
    
  }
  
  function getWordWithRegCharacterStart () {
    var nextWord = getWord();
    for (var i=0; i<=(nextWord.length-1); i++) {
      if (nextWord[i].search(/[^a-zA-Z]+/) == -1) {
        
        let wordattempt = nextWord.slice(i,nextWord.length);
        if (wordattempt == undefined) {
          console.log("oh hey then")
          console.log(lastSuccessfullWordAttempt)
          continue
        } else {
          return wordattempt
          
        }
        
        
      }
      if (i == nextWord.length - 1) { 
        return getWordWithRegCharacterStart();
        
      }
    }
    return "blob"
  }
  
  let lastHighestSpeed = 0
  
  function createLetters () {
    if (Math.random() < letter.probability) {
      
      // var x = Math.random() < 0.5 ? 1000;
      // var y = Math.random() * 1000;
      // const dX = 500;
      
      // var x = Math.random() * canvasObj.canvas.width;
      
      var leftStarter = (Math.random() * 200)
      
      
      var rightStarter = canvasObj.canvas.width - (Math.random() * 200)
      
      var x = Math.random() < 0.5 ? leftStarter : rightStarter;
      
      var y = Math.random() * canvasObj.canvas.height; 
      
      const dX = center.x - x;
      const dY = center.y - y;
      const norm = Math.sqrt(dX ** 2 + dY ** 2);
      
      const millis = Date.now() - startTimestamp;
      
      const secondsSinceStart = Math.floor(millis / 1000)
      
      let letterHighspeed = letter.initialHighestSpeed + (secondsSinceStart / 12) * 0.235
      if (letterHighspeed > letter.ultimateHighestSpeed) {
        
        letterHighspeed = letter.ultimateHighestSpeed + 0.10
      }
      
      if (lastHighestSpeed < letterHighspeed) {
        
        lastHighestSpeed = letterHighspeed
        console.log(letterHighspeed)
      }
      
      const lowSpeedIncrease = (secondsSinceStart / 5) * 0.14
      
      let suggestedLowSpeed = (letter.lowestSpeed + lowSpeedIncrease > letterHighspeed) ? letterHighspeed - 0.001 : letter.lowestSpeed + lowSpeedIncrease
      
      const speed = canvasObj.generateRandomNumber(suggestedLowSpeed, letterHighspeed);
      
      // canvasObj.generateRandomCharCode(caseSensitive)
      var nextWord = getWordWithRegCharacterStart()
      
      // if (nextWord == undefined) {
        
      //   console.log("well then")
      //   console.log(lastSuccessfullWordAttempt)
        
      // }
      
      // var charLength = nextWord.length;
      
      
      letters.push({
        x,
        y,
        code:nextWord.charCodeAt(0), // nextWord.charAt(0), //
        presentationString: nextWord,
        speedX: dX / norm * speed,
        speedY: dY / norm * speed
      });
    }
  }

  

 

  function removeLetters (frames) {
    for (const l of letters) {
      if (canvasObj.isIntersectingRectangleWithCircle({ x: l.x, y: l.y - letter.height }, letter.width, letter.height, center, center.radius)) {
        if (--lives === 0) {
          window.alert('GAME OVER! Your score for the round was ' + currentRoundScore + '. Your total score was: ' + score + '!');
          window.location.reload(false);
        } else if (lives > 0) {
          
          window.alert('Well done! Your score for the round was ' + currentRoundScore + '.');
          
          softResetRound()
          letters = [];
          
          
        }
        break;
      } else {
        l.x += l.speedX * frames;
        l.y += l.speedY * frames;
      }
    }
  }
  
  
  
  function type (i, l) {
    letters.splice(i, 1);
    currentRoundScore++;
    score++;
    particleObj.createParticles(l.x, l.y);
  }

  window.changeCase = function () {
    caseSensitive = !caseSensitive;
    if (caseSensitive) {
      document.getElementById('change-case-text').innerHTML = '';
    } else {
      document.getElementById('change-case-text').innerHTML = 'in';
    }
  };

  function keyDownHandler (e) {
    
    if (canvasObj.animationFetch() !== undefined ) {
      
      console.log("if (canvasObj.animationFetch() !== undefined ) {")
      
    }
    
    if (canvasObj.animationFetch() !== undefined && e.keyCode >= 65 && e.keyCode <= 90) {
      
      
      for (let i = letters.length - 1; i >= 0; i--) {
        const l = letters[i];
        if (caseSensitive) {
          if (e.shiftKey) {
            if (e.keyCode === l.code) {
              type(i, l);
              return;
            }
          } else {
            if (e.keyCode + 32 === l.code) {
              type(i, l);
              return;
            }
          }
        } else {
          if (e.keyCode === l.code || e.keyCode + 32 === l.code) {
            type(i, l);
            return;
          }
        }
      }
      score--;
      currentRoundScore--;
    }
  }

  // function keyUpHandler (e) {
  //   if (e.keyCode === 27) {
  //     if (canvasObj.animationFetch() === undefined) {
  //       canvasObj.animationSet(window.requestAnimationFrame(canvasObj.gameLoop));
  //     } else {
  //       window.cancelAnimationFrame(canvasObj.animationFetch());
  //       canvasObj.animationSet(undefined);
  //     }
  //   }
  // }
  
  
  
  // function renderScene (frames) {
    
  //   canvasObj.paintCircle(center.x, center.y, center.radius, center.color);
  //   canvasObj.ctx.font = letter.font;
  //   canvasObj.ctx.fillStyle = letter.color;
  //   for (const l of letters) {
  //     canvasObj.ctx.fillText(l.presentationString, l.x, l.y);
  //   }
  //   particleObj.paintParticles()
    
  //   canvasObj.ctx.font = canvasObj.label.font;
  //   canvasObj.ctx.fillStyle = canvasObj.label.color;
  //   // canvasObj.ctx.fillText('Score: ' + score, canvasObj.label.left, canvasObj.label.margin);
  //   canvasObj.ctx.fillText('Score: ' + currentRoundScore, canvasObj.label.left, canvasObj.label.margin);
    
  //   canvasObj.ctx.fillText('Lives: ' + lives, canvasObj.label.right, canvasObj.label.margin);
  //   particleObj.processParticles(frames);
  //   createLetters();
  //   removeLetters(frames);
    
  // }
  
  // renderScene(frames)
  function loopingFunction (frames) {
      
      if (gameClosed == true){
        console.log("ok closed")
        clearGameHandler ()
        return false
      }
      // renderScene(frames)
      
      canvasObj.paintCircle(center.x, center.y, center.radius, center.color);
      canvasObj.ctx.font = letter.font;
      canvasObj.ctx.fillStyle = letter.color;
      for (const l of letters) {
        canvasObj.ctx.fillText(l.presentationString, l.x, l.y);
      }
      particleObj.paintParticles()
      
      canvasObj.ctx.font = canvasObj.label.font;
      canvasObj.ctx.fillStyle = canvasObj.label.color;
      // canvasObj.ctx.fillText('Score: ' + score, canvasObj.label.left, canvasObj.label.margin);
      canvasObj.ctx.fillText('Score: ' + currentRoundScore, canvasObj.label.left, canvasObj.label.margin);
      
      canvasObj.ctx.fillText('Lives: ' + lives, canvasObj.label.right, canvasObj.label.margin);
      particleObj.processParticles(frames);
      createLetters();
      removeLetters(frames);
      
    }
  
  function initializeLoop () {
    
    canvasObj.loop(loopingFunction);
  }
  
  
  function addInterstitial () {
    
    var div = document.createElement('div')
  
    div.className = ''
    div.id = 'articleavalanche_interstitial_explainer'
    div.style.cssText = 'position:fixed; top:200px; left:0px; width:100%; z-index: 8000; text-align:center;' //left:170px; top: 190px; position:fixed;
    div.innerHTML = '<div style="margin: 0 auto; z-index: 8000; height: 500px; width: 500px; text-align:center;">Acheive a high score by typing the first letter of as many words as you can before they hit the blue circle! Uppercase matters! <br><br><button id="got_it_articleavalanche_interstitial_explainer"> Got it! </button><div>'

    document.body.appendChild(div)
    
    // add listeners
    // got_it_articleavalanche_interstitial_explainer
    var closeEl = document.getElementById("got_it_articleavalanche_interstitial_explainer")
  
    var _this = this
    
    closeEl.onclick = function(e) {
      
      var interstitialEl = document.getElementById("articleavalanche_interstitial_explainer");
      interstitialEl.style.visibility = "hidden"
      
      gameCommencedHandler()
      
      pauseToggle()
      
      
      if (runNumber != 1) {
        
        var pauseEl = document.getElementById("pausegame")
  
        pauseEl.click()
        
        console.log("yo yeah if (firstRun == false) {")
        // setTimeout(function() {
        //   console.log("upp2p")
        //   // pauseToggle()
          
        //   window.cancelAnimationFrame(canvasObj.animationFetch());
        //   canvasObj.animationSet(undefined)
          
        //   canvasObj.animationSet(window.requestAnimationFrame(canvasObj.gameLoopFetch()));
          
        // },1)
        
      }
    }
    
  }
  
  
  // 
  
  // 
  function pauseToggle() {
    if (canvasObj.animationFetch() === undefined) {
      canvasObj.animationSet(window.requestAnimationFrame(canvasObj.gameLoopFetch()));
    } else {
      window.cancelAnimationFrame(canvasObj.animationFetch());
      canvasObj.animationSet(undefined)
    }
  }
  
  function displayInterstitial () {
    
    // does interstitial exist?
    var interstitialEl = document.getElementById("articleavalanche_interstitial_explainer")
    
    if (interstitialEl == null) {
      // addInterstitial
      
      addInterstitial ()
    } else {
      interstitialEl.style.visibility = "visible"
    }
    
    
    
    
    // apply listener
    
      // initializeLoop ()
    
  }
  
  initializeLoop ()
  
  
  pauseToggle()
  
  displayInterstitial()
  
  
  // setTimeout(function(){ console.log("Hello"); pauseToggle()}, 3000);
  
  function resizeHandler () {
    canvasObj.canvas.width = window.innerWidth;
    canvasObj.canvas.height = window.innerHeight;
    center.x = canvasObj.canvas.width / 2;
    center.y = canvasObj.canvas.height / 2;
  }
  
  
  
  var pauseEl = document.getElementById("pausegame")
  
  pauseEl.onclick = function(e) {
    console.log("hello pause3!")
    
    var interstitialEl = document.getElementById("articleavalanche_interstitial_explainer")
    
    console.log(interstitialEl);
    if (interstitialEl.style.visibility != "hidden") {
      
      return
    }
    pauseToggle()
    console.log("yeah123123123123")
    if (canvasObj.animationFetch() === undefined) {
      pauseEl.innerHTML = "<button>start</button>"
    } else {
      pauseEl.innerHTML = "<button>pause</button>"
      
    }
    
    
    
  }
  
  runNumber += 1
  
  // could return pause alongside clearGameHandler
  return clearGameHandler
}





























