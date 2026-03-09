import React, { useState, useEffect } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (val: string) => void;
  delay?: number;
}

export function DebouncedInput({ value: initialValue, onChangeValue, delay = 300, ...props }: Props) {
  const [value, setValue] = useState(initialValue);

  // Sync external changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce notification
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChangeValue(value);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, initialValue, delay, onChangeValue]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => {
        if (value !== initialValue) onChangeValue(value);
        if (props.onBlur) props.onBlur(e);
      }}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChangeValue: (val: string) => void;
  delay?: number;
}

export function DebouncedTextarea({ value: initialValue, onChangeValue, delay = 300, ...props }: TextareaProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChangeValue(value);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, initialValue, delay, onChangeValue]);

  return (
    <textarea
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => {
        if (value !== initialValue) onChangeValue(value);
        if (props.onBlur) props.onBlur(e);
      }}
    />
  );
}
