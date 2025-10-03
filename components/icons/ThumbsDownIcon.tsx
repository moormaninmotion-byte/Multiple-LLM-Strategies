import React from 'react';

const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 14V2" />
    <path d="M5.12 13.12a2.89 2.89 0 0 0 4.24 4.24l2.64-2.64V20a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3.59a2 2 0 0 0-2-2h-7.59a2 2 0 0 0-1.9 1.2l-2.27 6.81a2 2 0 0 0 .17 2.18Z" />
  </svg>
);

export default ThumbsDownIcon;
