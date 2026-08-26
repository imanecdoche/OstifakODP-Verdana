import React from 'react';

interface PointIconProps {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}

/**
 * PPIcon — Render file SVG pp.svg dengan stroke dan fill 'currentColor'
 * agar warna ikon secara otomatis mewarisi (inherit) warna teks dari angka N yang disandingkan.
 */
export const PPIcon: React.FC<PointIconProps> = ({ 
  className = 'w-3.5 h-3.5', 
  size,
  style 
}) => {
  return (
    <svg
      viewBox="0 0 252 252"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: size,
        height: size,
        ...style
      }}
      className={`inline-block align-middle select-none shrink-0 ${className}`}
      aria-label="PP"
    >
      <path
        d="M126 8C191.17 8 244 60.8304 244 126C244 191.17 191.17 244 126 244C60.8304 244 8 191.17 8 126C8 60.8304 60.8304 8 126 8Z"
        stroke="currentColor"
        strokeWidth="16"
      />
      <path
        d="M84.6768 72C97.1778 72 107.058 75.6297 114.316 82.8887C121.625 90.1476 125.28 99.9773 125.28 112.378C125.28 124.325 121.651 133.803 114.393 140.81C107.184 147.816 97.3042 151.319 84.7529 151.319H68.4209V180.28H35V72H84.6768ZM185.246 72C197.747 72 207.627 75.6298 214.886 82.8887C222.195 90.1476 225.85 99.9774 225.85 112.378C225.85 124.325 222.22 133.803 214.961 140.81C207.753 147.816 197.873 151.319 185.321 151.319H168.989V180.28H135.569V72H185.246ZM168.989 125.232H181.087C185.069 125.232 188.22 124.224 190.539 122.208C192.858 120.192 194.017 117.091 194.017 112.907C194.017 108.774 192.781 105.724 190.312 103.758C187.842 101.742 184.59 100.733 180.558 100.733H168.989V125.232ZM68.4209 125.232H80.5186C84.5006 125.232 87.651 124.224 89.9697 122.208C92.2884 120.192 93.4482 117.091 93.4482 112.907C93.4482 108.774 92.2131 105.724 89.7432 103.758C87.2732 101.741 84.0217 100.733 79.9893 100.733H68.4209V125.232Z"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * PKIcon — Render file SVG pk.svg dengan stroke dan fill 'currentColor'
 * agar warna ikon secara otomatis mewarisi (inherit) warna teks dari angka N yang disandingkan.
 */
export const PKIcon: React.FC<PointIconProps> = ({ 
  className = 'w-3.5 h-3.5', 
  size,
  style 
}) => {
  return (
    <svg
      viewBox="0 0 252 252"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: size,
        height: size,
        ...style
      }}
      className={`inline-block align-middle select-none shrink-0 ${className}`}
      aria-label="PK"
    >
      <path
        d="M126 8C191.17 8 244 60.8304 244 126C244 191.17 191.17 244 126 244C60.8304 244 8 191.17 8 126C8 60.8304 60.8304 8 126 8Z"
        stroke="currentColor"
        strokeWidth="16"
      />
      <path
        d="M76.5488 76C88.0113 76 97.071 79.3278 103.727 85.9834C110.428 92.639 113.779 101.653 113.779 113.022C113.779 123.976 110.451 132.665 103.796 139.09C97.1865 145.514 88.1268 148.727 76.6182 148.727H61.6436V175.28H31V76H76.5488ZM153.856 112.246L185.055 76H218.888L183.056 116.98L220.205 175.28H185.748L162.879 138.341L153.856 147.14V175.28H123.213V76H153.856V112.246ZM61.6436 124.808H72.7363C76.3875 124.808 79.2763 123.884 81.4023 122.035C83.5284 120.186 84.5907 117.344 84.5908 113.508C84.5908 109.718 83.4591 106.921 81.1943 105.118C78.9297 103.269 75.9483 102.346 72.251 102.346H61.6436V124.808Z"
        fill="currentColor"
      />
    </svg>
  );
};
