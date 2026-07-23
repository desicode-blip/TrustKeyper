import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput } from "react-native";
import { sendPhoneOtp } from "@/lib/auth/phoneOtp";
import { PhoneFormSchema, type PhoneFormValues } from "@/lib/auth/schemas";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

export default function PhoneScreen() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(PhoneFormSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const error = await sendPhoneOtp(values.phone);
      if (error) {
        setSubmitError(error);
        return;
      }
      router.push({ pathname: "/(auth)/otp", params: { phone: values.phone } });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScreenSafeArea>
      <Text>Phone number</Text>
      <Text>+91</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!isSubmitting}
            placeholder="10-digit mobile"
            autoComplete="tel"
          />
        )}
      />
      {errors.phone ? <Text>{errors.phone.message}</Text> : null}
      {submitError ? <Text>{submitError}</Text> : null}
      <Button title={isSubmitting ? "Sending…" : "Send OTP"} onPress={() => void onSubmit()} disabled={isSubmitting} />
    </ScreenSafeArea>
  );
}
