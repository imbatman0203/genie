export default function Logo({ size = 28 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Genie"
      >
        {/* Wisp of smoke rising from the spout */}
        <path
          d="M 4 29 C 4 24, 9 23, 9 18 C 9 14, 6 12, 7 8 C 7.5 5.5, 9 4, 11 3"
          stroke="#1A1815"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Red spark at the tip */}
        <circle cx="11.5" cy="2.5" r="1.8" fill="#C9401B" />
  
        {/* Lamp bowl */}
        <path
          d="M 5 30 Q 5 26, 10 25 L 30 25 Q 35 26, 35 30 Q 35 34, 20 34 Q 5 34, 5 30 Z"
          fill="#1A1815"
        />
        {/* Spout tip */}
        <path d="M 5 30 L 2 27.5 L 2 31.5 Z" fill="#1A1815" />
        {/* Handle */}
        <path
          d="M 34 28 C 39 28, 39 33, 34 33"
          stroke="#1A1815"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }