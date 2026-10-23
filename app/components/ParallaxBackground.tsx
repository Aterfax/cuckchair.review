'use client';

import { useEffect, useRef } from 'react';
import styles from './ParallaxBackground.module.css';

interface ParallaxLayer {
  speed: number;
  top: string;
  left: string;
  size: string;
  color: string;
}

const LAYERS: ParallaxLayer[] = [
  { speed: 0.06, top: '5%', left: '60%', size: '580px', color: '99 102 241' },
  { speed: 0.18, top: '72%', left: '88%', size: '420px', color: '245 158 11' },
  { speed: 0.24, top: '82%', left: '-12%', size: '540px', color: '79 70 229' },
  { speed: 0.10, top: '32%', left: '96%', size: '300px', color: '251 191 36' },
  { speed: 0.14, top: '50%', left: '-16%', size: '400px', color: '99 102 241' },
];

export default function ParallaxBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onScroll = () => {
      wrap.style.setProperty('--scroll', `${window.scrollY}px`);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={wrapRef} className={styles.parallaxWrap}>
      {LAYERS.map((layer, i) => {
        const orbStyle: React.CSSProperties & Record<string, string> = {
          top: layer.top,
          left: layer.left,
          width: layer.size,
          height: layer.size,
          '--orb-color': layer.color,
          '--speed': String(layer.speed),
        };
        return (
          <div
            key={i}
            className={styles.parallaxLayer}
            data-speed={layer.speed}
            style={orbStyle}
          />
        );
      })}
    </div>
  );
}
