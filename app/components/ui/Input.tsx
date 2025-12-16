// app/components/ui/Input.tsx
"use client";
import React from "react";

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: "text" | "select" | "textarea" | "file";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  multiple?: boolean;
  accept?: string;
  className?: string;
  colSpan?: 1 | 2; // Add colSpan prop
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  options = [],
  multiple = false,
  accept,
  className = "",
  colSpan = 1, // Default to 1 column
}) => {
  // Consolidated class names in one place
  const baseClasses = {
    label:
      "font-gess flex flex-col gap-1 text-[5vw] md:text-[2vw] lg:text-[1.5vw] 2xl:text-[1vw] font-bold text-gray-500",
    input:
      "w-full text-gray-400  font-bold font-gess border-1 border-[#1A83FF]  placeholder:text-gray-400 p-2",
    placeholder:
      "placeholder:text-[4vw] md:placeholder:text-[2vw] lg:placeholder:text-[1.2vw] 2xl:placeholder:text-[1vw]",
    select: "text-gray-400 py-3 px-2",
  };
  const colSpanClasses = colSpan === 2 ? "md:col-span-2" : "";

  const renderInput = () => {
    const commonProps = {
      name,
      value,
      onChange,
      placeholder,
      required,
      className: `${baseClasses.input} ${baseClasses.placeholder} ${className}`,
    };

    switch (type) {
      case "select":
        return (
          <select
            {...commonProps}
            className={`${commonProps.className} ${baseClasses.select}`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return <textarea {...commonProps} rows={4} />;

      case "file":
        return (
          <div className="relative">
            <input
              type="file"
              name={name}
              onChange={onChange}
              multiple={multiple}
              accept={accept}
              className={commonProps.className}
            />
          </div>
        );

      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <div className={colSpanClasses}>
      <label className={baseClasses.label}>
        {label}
        {renderInput()}
      </label>
    </div>
  );
};

export default Input;
