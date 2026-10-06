import React from "react";
import { siteConfig } from "@/lib/site-config";

// Official brand SVG icons
const FOOTER_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-4 h-4 fill-current flex-none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  whatsapp: (
    <svg className="w-4 h-4 fill-current flex-none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.16c-.24.68-1.4 1.26-1.94 1.33-.51.07-1.16.1-3.37-.8-2.82-1.15-4.64-4.04-4.78-4.23-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.36.26-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.65.49.24.58.82 2.01.89 2.16.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.15-.3.32-.13.62.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.45.29.15.46.13.63-.07.17-.2.74-.86.94-1.16.2-.29.39-.24.66-.14.27.1 1.72.81 2.02.96.29.15.49.22.56.34.07.12.07.71-.17 1.39z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4 fill-current flex-none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45 1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45m1.37 9.74v-8.37H5.1v8.37h2.73z" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4 fill-current flex-none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

export const FooterSocialLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-2 select-none" role="group" aria-label="Social media links">
      {siteConfig.footerSocialLinks.map((soc) => (
        <a
          key={soc.key}
          href={soc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-[#26231B] hover:bg-[#C51616] text-[#FFC20E] hover:text-white grid place-items-center transition-all duration-150 no-underline shadow-xs focus:outline-none focus-visible:outline-[#26231B] focus-visible:outline-2"
          aria-label={`${soc.label} (opens in new tab)`}
          title={soc.label}
        >
          {FOOTER_ICONS[soc.key]}
        </a>
      ))}
    </div>
  );
};
