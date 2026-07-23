import { zodResolver } from "@hookform/resolvers/zod";
import { BrokerOnboardingStep2Schema } from "@workspace/api-schemas";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput } from "react-native";
import { z } from "zod";
import { patchBrokerProfile } from "@/lib/api/client";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

type Step2Values = z.infer<typeof BrokerOnboardingStep2Schema>;

export default function OnboardingStep2() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(BrokerOnboardingStep2Schema),
    defaultValues: {
      businessSinceYear: 2018,
      propertiesHandled: 0,
      stepCompleted: 2,
    },
  });

  const onNext = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await patchBrokerProfile({
        businessSinceYear: values.businessSinceYear,
        propertiesHandled: values.propertiesHandled,
        stepCompleted: 2,
      });
      router.push("/(onboarding)/step-3");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save step 2");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScreenSafeArea>
      <Text>Step 2 of 4 — Experience</Text>
      <Text>Business since (year)</Text>
      <Controller
        control={control}
        name="businessSinceYear"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={String(value ?? "")}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
            keyboardType="number-pad"
            editable={!isSubmitting}
            placeholder="YYYY"
          />
        )}
      />
      {errors.businessSinceYear ? <Text>{errors.businessSinceYear.message}</Text> : null}

      <Text>Properties handled</Text>
      <Controller
        control={control}
        name="propertiesHandled"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={String(value ?? "")}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
            keyboardType="number-pad"
            editable={!isSubmitting}
            placeholder="Count"
          />
        )}
      />
      {errors.propertiesHandled ? <Text>{errors.propertiesHandled.message}</Text> : null}

      {submitError ? <Text>{submitError}</Text> : null}
      <Button
        title={isSubmitting ? "Saving…" : "Next"}
        onPress={() => void onNext()}
        disabled={isSubmitting}
      />
    </ScreenSafeArea>
  );
}
