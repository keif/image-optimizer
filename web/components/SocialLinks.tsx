import { Facebook, Twitter, Instagram } from 'lucide-react';

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

// Bluesky SVG icon (lucide-react doesn't have it)
const BlueskyIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
  </svg>
);

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/SoSquishy.io/',
    icon: Facebook,
    color: 'hover:text-blue-600',
    bgColor: 'from-blue-600 to-blue-700',
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/SoSquishyIO',
    icon: Twitter,
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
    icon: Instagram,
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
