import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormMessageProps = {
  variant: "error" | "success";
  title: string;
  description?: string;
};

/** Message global d'un formulaire (erreur ou succès). */
export function FormMessage({ variant, title, description }: FormMessageProps) {
  const Icon = variant === "error" ? CircleAlertIcon : CircleCheckIcon;
  return (
    <Alert variant={variant === "error" ? "destructive" : "default"} role={variant === "error" ? "alert" : "status"}>
      <Icon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
    </Alert>
  );
}
