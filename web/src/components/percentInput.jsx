import { forwardRef } from "react";

const PercentInput = forwardRef(
  ({ name, label, placeholder, onChange, disabled }, ref) => (
    <>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <input
          type="text"
          name={name}
          id={name}
          ref={ref}
          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-interPurple sm:text-sm sm:leading-6"
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm">%</span>
        </div>
      </div>
    </>
  )
);

PercentInput.displayName = "PercentInput";

export { PercentInput };
