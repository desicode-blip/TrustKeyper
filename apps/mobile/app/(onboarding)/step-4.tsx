import { zodResolver } from "@hookform/resolvers/zod";
import { BrokerOnboardingStep4Schema } from "@workspace/api-schemas";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput } from "react-native";
import { z } from "zod";
import { patchBrokerProfile } from "@/lib/api/client";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

type Step4Values = z.infer<typeof BrokerOnboardingStep4Schema>;

function parsePincodes(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export default function OnboardingStep4() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(BrokerOnboardingStep4Schema),
    defaultValues: {
      region: "",
      pincodes: [],
      stepCompleted: 4,
    },
  });

  const pincodes = watch("pincodes");

  const onNext = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await patchBrokerProfile({
        region: values.region,
        pincodes: values.pincodes,
        stepCompleted: 4,
      });
      router.replace("/(tabs)/home");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save step 4");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScreenSafeArea>
      <Text>Step 4 of 4 — Region</Text>
      <Text>Primary region / city</Text>
      <Controller
        control={control}
        name="region"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            editable={!isSubmitting}
            placeholder="e.g. Bengaluru"
            autoCapitalize="words"
          />
        )}
      />
      {errors.region ? <Text>{errors.region.message}</Text> : null}

      <Text>Pincodes (comma or space separated)</Text>
      <TextInput
        value={pincodeInput}
        onChangeText={(text) => {
          setPincodeInput(text);
          setValue("pincodes", parsePincodes(text), { shouldValidate: true });
        }}
        editable={!isSubmitting}
        keyboardType="number-pad"
        placeholder="560001 560034"
      />
      {pincodes.length > 0 ? <Text>Selected: {pincodes.join(", ")}</Text> : null}
      {errors.pincodes ? <Text>{errors.pincodes.message}</Text> : null}

      {submitError ? <Text>{submitError}</Text> : null}
      <Button
        title={isSubmitting ? "Finishing…" : "Finish"}
        onPress={() => void onNext()}
        disabled={isSubmitting}
      />
    </ScreenSafeArea>
  );
}
