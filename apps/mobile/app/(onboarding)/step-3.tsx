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

const DEAL_OPTIONS = [
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Sale" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
] as const;

const PROPERTY_OPTIONS = [
  { value: "flats", label: "Flats" },
  { value: "independent_house", label: "Independent house" },
  { value: "community_flats", label: "Community flats" },
  { value: "villas", label: "Villas" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
] as const;

type DealOption = (typeof DEAL_OPTIONS)[number]["value"];
type PropertyOption = (typeof PROPERTY_OPTIONS)[number]["value"];

function toggleDeal(list: DealOption[], value: DealOption): DealOption[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function toggleProperty(list: PropertyOption[], value: PropertyOption): PropertyOption[] {
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

  const onToggleDealsWith = (option: DealOption) => {
    const next = toggleDeal(dealsWith, option);
    setValue("dealsWith", next, { shouldValidate: true });
    if (!next.includes("other")) {
      setValue("dealsWithOther", null, { shouldValidate: true });
    }
  };

  const onTogglePropertyTypes = (option: PropertyOption) => {
    const next = toggleProperty(propertyTypes, option);
    setValue("propertyTypes", next, { shouldValidate: true });
    if (!next.includes("other")) {
      setValue("propertyTypesOther", null, { shouldValidate: true });
    }
  };

  const onNext = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await patchBrokerProfile({
        dealsWith: values.dealsWith,
        dealsWithOther: values.dealsWith.includes("other")
          ? (values.dealsWithOther ?? null)
          : null,
        propertyTypes: values.propertyTypes,
        propertyTypesOther: values.propertyTypes.includes("other")
          ? (values.propertyTypesOther ?? null)
          : null,
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
      <Text>What do you deal with?</Text>
      <View>
        {DEAL_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onToggleDealsWith(option.value)}
            disabled={isSubmitting}
          >
            <Text>
              {dealsWith.includes(option.value) ? "☑ " : "☐ "}
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.dealsWith ? <Text>{errors.dealsWith.message}</Text> : null}

      {dealsWith.includes("other") ? (
        <View>
          <Text>Describe other</Text>
          <Controller
            control={control}
            name="dealsWithOther"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value ?? ""}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.length > 0 ? text : null)}
                editable={!isSubmitting}
                placeholder="Other deal type"
              />
            )}
          />
          {errors.dealsWithOther ? <Text>{errors.dealsWithOther.message}</Text> : null}
        </View>
      ) : null}

      <Text>Property types</Text>
      <View>
        {PROPERTY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onTogglePropertyTypes(option.value)}
            disabled={isSubmitting}
          >
            <Text>
              {propertyTypes.includes(option.value) ? "☑ " : "☐ "}
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.propertyTypes ? <Text>{errors.propertyTypes.message}</Text> : null}

      {propertyTypes.includes("other") ? (
        <View>
          <Text>Describe other</Text>
          <Controller
            control={control}
            name="propertyTypesOther"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value ?? ""}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.length > 0 ? text : null)}
                editable={!isSubmitting}
                placeholder="Other property type"
              />
            )}
          />
          {errors.propertyTypesOther ? (
            <Text>{errors.propertyTypesOther.message}</Text>
          ) : null}
        </View>
      ) : null}

      {submitError ? <Text>{submitError}</Text> : null}
      <Button
        title={isSubmitting ? "Saving…" : "Next"}
        onPress={() => void onNext()}
        disabled={isSubmitting}
      />
    </ScreenSafeArea>
  );
}
