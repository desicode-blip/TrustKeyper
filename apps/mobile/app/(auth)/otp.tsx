import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getAccountRoles } from "@/lib/api/client";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/phoneOtp";
import { OtpFormSchema, type OtpFormValues } from "@/lib/auth/schemas";
import { saveSessionIdentity } from "@/lib/auth/secureSession";
import { normalizePhoneDigits } from "@workspace/auth-server/phone";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = useMemo(() => normalizePhoneDigits(params.phone ?? ""), [params.phone]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(OtpFormSchema),
    defaultValues: { phone, token: "" },
  });

  const rolesQuery = useQuery({
    queryKey: ["account-roles", phone],
    queryFn: () => getAccountRoles(phone),
    enabled: false,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await verifyPhoneOtp(values.phone, values.token);
      if (result.error || !result.accessToken) {
        setSubmitError(result.error ?? "Verification failed");
        return;
      }

      const rolesResult = await rolesQuery.refetch();
      const roles = rolesResult.data?.roles ?? [];
      if (roles.length === 0) {
        router.replace("/(onboarding)/step-1");
        return;
      }

      const role = roles[0] ?? null;
      await saveSessionIdentity({ phone: values.phone, role });
      router.replace("/(tabs)/home");
    } finally {
      setIsSubmitting(false);
    }
  });

  const onResend = async () => {
    setSubmitError(null);
    const error = await sendPhoneOtp(phone);
    if (error) {
      setSubmitError(error);
    }
  };

  return (
    <View>
      <Text>Enter OTP</Text>
      <Text>Sent to +91{phone}</Text>
      <Controller
        control={control}
        name="token"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isSubmitting}
            placeholder="6-digit OTP"
            autoComplete="one-time-code"
          />
        )}
      />
      {errors.token ? <Text>{errors.token.message}</Text> : null}
      {submitError ? <Text>{submitError}</Text> : null}
      <Button title={isSubmitting ? "Verifying…" : "Verify"} onPress={() => void onSubmit()} disabled={isSubmitting} />
      <Button title="Resend OTP" onPress={() => void onResend()} disabled={isSubmitting} />
    </View>
  );
}
