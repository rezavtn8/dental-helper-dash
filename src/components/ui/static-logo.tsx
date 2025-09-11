interface StaticLogoProps {
  size?: number;
  className?: string;
}

export const StaticLogo = ({ size = 120, className = "" }: StaticLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 20 L50 5 L80 20 L80 50 L50 65 L20 50 Z M35 30 L50 25 L65 30 L65 45 L50 50 L35 45 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
};