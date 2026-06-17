interface SocialLinksProps {
  /**
   * Size of the icons in pixels
   */
  size?: number;
  /**
   * Show labels alongside icons
   */
  showLabels?: boolean;
  /**
   * Layout direction
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Custom className for container
   */
  className?: string;
  /**
   * Icon color/style variant
   */
  variant?: 'default' | 'footer' | 'colorful';
}

// Brand SVG icons (lucide-react dropped brand icons in v1)
type IconProps = { size?: number };

const svgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  xmlns: 'http://www.w3.org/2000/svg',
});

const BlueskyIcon = ({ size = 20 }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
  </svg>
);

const FacebookIcon = ({ size = 20 }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

const XIcon = ({ size = 20 }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }: IconProps) => (
  <svg {...svgProps(size)}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/SoSquishy.io/',
    icon: FacebookIcon,
    color: 'hover:text-blue-600',
    bgColor: 'from-blue-600 to-blue-700',
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/SoSquishyIO',
    icon: XIcon,
    color: 'hover:text-gray-900 dark:hover:text-gray-100',
    bgColor: 'from-gray-800 to-gray-900',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/sosquishy.bsky.social',
    icon: BlueskyIcon,
    color: 'hover:text-sky-600',
    bgColor: 'from-sky-500 to-sky-600',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/sosquishyio',
    icon: InstagramIcon,
    color: 'hover:text-pink-600',
    bgColor: 'from-pink-500 via-purple-500 to-orange-500',
  },
];

export default function SocialLinks({
  size = 20,
  showLabels = false,
  direction = 'horizontal',
  className = '',
  variant = 'default',
}: SocialLinksProps) {
  const containerClass = direction === 'horizontal'
    ? 'flex items-center gap-4'
    : 'flex flex-col gap-3';

  const getIconClass = () => {
    switch (variant) {
      case 'footer':
        return 'text-gray-600 dark:text-gray-400 transition-colors';
      case 'colorful':
        return 'transition-colors';
      default:
        return 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors';
    }
  };

  return (
    <div className={`${containerClass} ${className}`}>
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 ${getIconClass()} ${variant === 'colorful' ? social.color : ''}`}
            aria-label={social.name}
            title={social.name}
          >
            <Icon size={size} />
            {showLabels && (
              <span className="text-sm font-medium">{social.name}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

// Export social links data for use in other components
export { socialLinks };
