"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: "primary" | "secondPrimary" | "dashboardbutton";
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode; // Optional icon
}

export const Button = ({
  kind = "primary",
  children,
  icon,
  loading,
  ...props // ⬅️ This includes onClick, className, etc.
}: ButtonProps) => {
  const variantClasses = {
    primary:
      "bg-[#1A83FF] w-[55vw] md:w-[30vw] 2xl:w-[18vw] py-3 rounded-[16px] font-gess font-bold text-white text-[5vw] md:text-[3vw] 2xl:text-[1.5vw]",
    secondPrimary:
      "bg-[#1A83FF] w-[55vw] md:w-[30vw] 2xl:w-[18vw] py-3 rounded-[16px] font-gess font-bold text-white text-[5vw] md:text-[3vw] 2xl:text-[1.5vw] hidden lg:block",
    dashboardbutton:
      "bg-[#1A83FF] text-[4vw] md:text-[2vw] lg:text-[1.5vw]  relative flex flex-col gap-6 w-full rounded-lg p-8 text-white text-sm font-semibold relative",
  };

  return (
    <button
      {...props} // ⬅️ Forward all props (like onClick)
      className={`${variantClasses[kind]} ${props.className ?? ""}`}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <span className="animate-pulse">جار التحميل...</span>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
