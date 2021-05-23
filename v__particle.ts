// much of the code below is from here https://github.com/berkerol/typer/
// the license: https://github.com/berkerol/typer/blob/master/LICENSE
// the copyright for much of the code in this file likely belongs to https://github.com/berkerol Berk Erol though I could not find explicit copyright info in the repository


/* global canvas paintCircle generateRandomNumber generateRandomRgbColor */
/* eslint-disable no-unused-vars */

export var initParticle = function(canvasObj) {
  
  
  
  
  const particle = {
    decrease: 0.05,
    highestAlpha: 0.8,
    highestRadius: 5,
    highestSpeedX: 5,
    highestSpeedY: 5,
    lowestAlpha: 0.4,
    lowestRadius: 2,
    lowestSpeedX: -5,
    lowestSpeedY: -5,
    total: 100
  };

  const particles = [];

  const paintParticles = () => {
    // console.log("particles.count")
    // console.log(particles.length)
    for (const p of particles) {
      canvasObj.paintCircle(p.x, p.y, p.radius, p.color);
    }
  };

  const createParticles = (x, y) => {
    
    // console.log("particles created")
    
    
    for (let i = 0; i < particle.total; i++) {
      const c = canvasObj.generateRandomRgbColor();
      const alpha = canvasObj.generateRandomNumber(particle.lowestAlpha, particle.highestAlpha);
      particles.push({
        x,
        y,
        radius: canvasObj.generateRandomNumber(particle.lowestRadius, particle.highestRadius),
        color: `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`,
        speedX: canvasObj.generateRandomNumber(particle.lowestSpeedX, particle.highestSpeedX),
        speedY: canvasObj.generateRandomNumber(particle.lowestSpeedY, particle.highestSpeedY)
      });
    }
    
    // console.log("particles.count2")
    // console.log(particles.length)
  };

  const processParticles = frames => {
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.speedX * frames;
      p.y += p.speedY * frames;
      p.radius -= particle.decrease;
      if (p.radius <= 0 || p.x < 0 || p.x > canvasObj.canvas.width || p.y < 0 || p.y > canvas.height) {
        particles.splice(i, 1);
      }
    }
  };
  
  return {
    paintParticles:paintParticles,
    createParticles:createParticles,
    processParticles:processParticles
    
  }
}