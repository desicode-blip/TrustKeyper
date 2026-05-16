import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Box = "div" as const;

interface AuthPhoneFieldProps {
  id: string;
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  helperText?: string;
  errorText?: string | null;
}

export function AuthPhoneField({
  id,
  value,
  onChange,
  disabled = false,
  helperText = "We'll send an OTP to verify",
  errorText = null,
}: AuthPhoneFieldProps) {
  return (
    <Box className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">
        Phone Number
      </Label>
      <Box className="flex gap-2">
        <Box className="w-14 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 text-sm shrink-0">
          +91
        </Box>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit number"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          disabled={disabled}
          className="bg-white flex-1"
        />
      </Box>
      {errorText ? (
        <p className="text-sm text-destructive">{errorText}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
    </Box>
  );
}
