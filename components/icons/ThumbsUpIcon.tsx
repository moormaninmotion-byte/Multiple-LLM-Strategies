import React from 'react';

const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M7 10v12" />
    <path d="M18.88 10.88a2.89 2.89 0 0 0-4.24-4.24l-2.64 2.64V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v13.59a2 2 0 0 0 2 2h7.59a2 2 0 0 0 1.9-1.2l2.27-6.81a2 2 0 0 0-.17-2.18Z" />
  </svg>
);

export default ThumbsUpIcon;
