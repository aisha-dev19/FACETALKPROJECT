import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 block text-xl text-slate-600"
      >
        {label} <span className="text-red-700">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12.5 w-full rounded-md border border-[#705a5a] px-3 pr-12 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {isVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
