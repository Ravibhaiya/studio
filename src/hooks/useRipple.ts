// src/hooks/useRipple.ts
import { useCallback } from 'react';

export const useRipple = () => {
  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const surface = event.currentTarget;
    // Create a container for the ripple if it doesn't exist
    let rippleContainer = surface.querySelector(
      '.ripple-container'
    ) as HTMLElement;
    if (!rippleContainer) {
      rippleContainer = document.createElement('div');
      rippleContainer.className = 'ripple-container';
      surface.appendChild(rippleContainer);
      surface.style.position = 'relative'; // Ensure the container is positioned correctly
      surface.style.overflow = 'hidden';
    }

    // Clear previous ripples
    rippleContainer.innerHTML = '';

    const circle = document.createElement('span');
    const diameter = Math.max(surface.clientWidth, surface.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;

    const rect = rippleContainer.getBoundingClientRect();
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    rippleContainer.appendChild(circle);

    // Clean up the ripple element after the animation ends
    circle.addEventListener('animationend', () => {
      circle.remove();
    });
  }, []);

  return createRipple;
};
