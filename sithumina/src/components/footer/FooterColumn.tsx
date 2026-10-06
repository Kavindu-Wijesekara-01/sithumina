import React from "react";

interface FooterColumnProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FooterColumn: React.FC<FooterColumnProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {title && (
        <h3 className="text-[13.5px] font-black text-[#26231B] tracking-tight m-0 select-none">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
