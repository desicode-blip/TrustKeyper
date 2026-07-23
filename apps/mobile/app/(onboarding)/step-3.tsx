import { zodResolver } from "@hookform/resolvers/zod";
import { BrokerOnboardingStep3Schema } from "@workspace/api-schemas";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { patchBrokerProfile } from "@/lib/api/client";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

type Step3Values = z.infer<typeof BrokerOnboardingStep3Schema>;

const DEAL_OPTIONS = ["owners", "tenants", "buyers", "sellers"] as const;
const PROPERTY_OPTIONS = ["apartment", "villa", "independent_house", "commercial"] as const;

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function OnboardingStep3() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(BrokerOnboardingStep3Schema),
    defaultValues: {
      dealsWith: [],
      dealsWithOther: null,
      propertyTypes: [],
      propertyTypesOther: null,
      stepCompleted: 3,
    },
  });

  const dealsWith = watch("dealsWith");
  const propertyTypes = watch("propertyTypes");

  const onNext = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await patchBrokerProfile({
        dealsWith: values.dealsWith,
        dealsWithOther: values.dealsWithOther ?? null,
        propertyTypes: values.propertyTypes,
        propertyTypesOther: values.propertyTypesOther ?? null,
        stepCompleted: 3,
      });
      router.push("/(onboarding)/step-4");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save step 3");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScreenSafeArea>
      <Text>Step 3 of 4 — Focus</Text>
      <Text>Who do you deal with?</Text>
      <View>
        {DEAL_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() =>
              setValue("dealsWith", toggleValue(dealsWith, option), { shouldValidate: true })
            }
            disabled={isSubmitting}
          >
            <Text>
              {dealsWith.includes(option) ? "☑ " : "☐ "}
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.dealsWith ? <Text>{errors.dealsWith.message}</Text> : null}

      <Text>Other (optional)</Text>
      <Controller
        control={control}
        name="dealsWithOther"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value ?? ""}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.length > 0 ? text : null)}
            editable={!isSubmitting}
            placeholder="Other counterparties"
          />
        )}
      />

      <Text>Property types</Text>
      <View>
        {PROPERTY_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() =>
              setValue("propertyTypes", toggleValue(propertyTypes, option), {
                shouldValidate: true,
              })
            }
            disabled={isSubmitting}
          >
            <Text>
              {propertyTypes.includes(option) ? "☑ " : "☐ "}
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.propertyTypes ? <Text>{errors.propertyTypes.message}</Text> : null}

      <Text>Other property type (optional)</Text>
      <Controller
        control={control}
        name="propertyTypesOther"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value ?? ""}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.length > 0 ? text : null)}
            editable={!isSubmitting}
            placeholder="Other types"
          />
        )}
      />

      {submitError ? <Text>{submitError}</Text> : null}
      <Button
        title={isSubmitting ? "Saving…" : "Next"}
        onPress={() => void onNext()}
        disabled={isSubmitting}
      />
    </ScreenSafeArea>
  );
}
