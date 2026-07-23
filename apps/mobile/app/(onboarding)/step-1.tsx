import { zodResolver } from "@hookform/resolvers/zod";
import { BrokerOnboardingStep1Schema } from "@workspace/api-schemas";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { patchBrokerProfile } from "@/lib/api/client";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

type Step1Values = z.infer<typeof BrokerOnboardingStep1Schema>;

const EMPLOYMENT_OPTIONS = [
  { value: "self_employed", label: "Self-employed" },
  { value: "salaried", label: "Salaried" },
  { value: "firm_partner", label: "Firm partner" },
  { value: "other", label: "Other" },
] as const;

export default function OnboardingStep1() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(BrokerOnboardingStep1Schema),
    defaultValues: {
      name: "",
      age: 25,
      firmName: null,
      employmentType: "self_employed",
      stepCompleted: 1,
    },
  });

  const employmentType = watch("employmentType");

  const onNext = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await patchBrokerProfile({
        name: values.name,
        age: values.age,
        firmName: values.firmName ?? null,
        employmentType: values.employmentType,
        stepCompleted: 1,
      });
      router.push("/(onboarding)/step-2");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save step 1");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScreenSafeArea>
      <Text>Step 1 of 4 — About you</Text>
      <Text>Name</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            editable={!isSubmitting}
            placeholder="Full name"
            autoCapitalize="words"
          />
        )}
      />
      {errors.name ? <Text>{errors.name.message}</Text> : null}

      <Text>Age</Text>
      <Controller
        control={control}
        name="age"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={String(value ?? "")}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
            keyboardType="number-pad"
            editable={!isSubmitting}
            placeholder="Age"
          />
        )}
      />
      {errors.age ? <Text>{errors.age.message}</Text> : null}

      <Text>Firm name (optional)</Text>
      <Controller
        control={control}
        name="firmName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value ?? ""}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.length > 0 ? text : null)}
            editable={!isSubmitting}
            placeholder="Firm name"
          />
        )}
      />

      <Text>Employment type</Text>
      <View>
        {EMPLOYMENT_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setValue("employmentType", option.value, { shouldValidate: true })}
            disabled={isSubmitting}
          >
            <Text>
              {employmentType === option.value ? "● " : "○ "}
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.employmentType ? <Text>{errors.employmentType.message}</Text> : null}

      {submitError ? <Text>{submitError}</Text> : null}
      <Button
        title={isSubmitting ? "Saving…" : "Next"}
        onPress={() => void onNext()}
        disabled={isSubmitting}
      />
    </ScreenSafeArea>
  );
}
