import React from 'react';

// Reusable stars component
// - value: number (0..5)
// - onChange?: (newValue:number) => void   (if provided => interactive)
// - size?: number
// - readOnly?: boolean
export default function StarRating({ value = 0, onChange, size = 22, readOnly = false }) {
  const interactive = typeof onChange === 'function' && !readOnly;

  const starStyle = (filled) => ({
    fontSize: `${size}px`,
    color: filled ? '#f5b301' : '#d9d9d9',
    cursor: interactive ? 'pointer' : 'default',
    userSelect: 'none',
    lineHeight: 1
  });

  return (
    <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }} aria-label={`Note: ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        return (
          <span
            key={i}
            role={interactive ? 'button' : 'img'}
            tabIndex={interactive ? 0 : -1}
            style={starStyle(filled)}
            onClick={interactive ? () => onChange(i) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') onChange(i);
                  }
                : undefined
            }
            aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

