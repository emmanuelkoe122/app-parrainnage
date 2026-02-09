import confetti from 'canvas-confetti';

export const triggerExplosion = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

export const triggerFire = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#fbbf24'] // Fire colors
      });
}

// Nouvel effet pour la validation d'une étape (ex: Filleul trouvé)
export const triggerSelection = (xPosition: number) => {
    confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: xPosition, y: 0.5 },
        colors: ['#ffffff', '#fbbf24'],
        gravity: 1.2,
        scalar: 0.8,
        drift: 0,
        ticks: 100
    });
}