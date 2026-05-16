import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthPhoneFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorText?: string | null;
}

export function AuthPhoneField({
  id = "auth-phone",
  label = "Phone Number",
  value,
  onChange,
  disabled = false,
  required = false,
  helperText = "We'll send an OTP to verify",
  errorText = null,
}: AuthPhoneFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="flex gap-2">
        <div
          className={`w-16 flex items-center justify-center rounded-md border border-input text-gray-700 text-sm shrink-0 h-12 ${
            disabled ? "bg-[#E8EEF5]" : "bg-[#E2E8F0]"
          }`}
        >
          +91
        </div>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit number"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          disabled={disabled}
          className={`flex-1 h-12 border-none ${
            disabled ? "bg-[#E8EEF5] text-gray-600" : "bg-[#F1F5F9] text-gray-900"
          }`}
        />
      </div>
      {errorText ? (
        <p className="text-sm text-destructive">{errorText}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
