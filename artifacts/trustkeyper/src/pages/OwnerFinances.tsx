import { useEffect } from "react";
import { useLocation } from "wouter";

export default function OwnerFinances() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/owner/dashboard");
  }, [setLocation]);
  return null;
}
