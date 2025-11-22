import React from 'react';

export default function BaseInput({ value, onChange, placeholder, className, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`rounded-md bg-neutral-950 border border-neutral-800 px-2 py-1 text-[11px] text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500 ${className}`}
      placeholder={placeholder}
    />
  );
}
