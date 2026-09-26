"use client";

import { useState } from "react";
import { dangerButtonClass } from "./ui";

/** A submit button that asks for a second click before submitting. */
export function ConfirmButton({
  label,
  confirmLabel = "Click again to confirm",
  className = dangerButtonClass,
}: {
  label: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type={armed ? "submit" : "button"}
      className={className}
      onClick={() => {
        if (!armed) setArmed(true);
      }}
      onBlur={() => setArmed(false)}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
