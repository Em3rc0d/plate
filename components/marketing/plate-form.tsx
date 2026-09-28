"use client";

import { browserTrack } from "@/src/analytics/browser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { normalizePlate } from "@/src/vehicle/normalize-plate";
import { Button } from "@/components/ui/button";

export function PlateForm() {
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <form
      className="query master-query"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          browserTrack("plate_submitted");
          router.push(`/consulta?plate=${normalizePlate(plate)}`);
        } catch {
          setError("Revisa la placa e inténtalo nuevamente.");
        }
      }}
    >
      <label className="sr-only" htmlFor="plate">
        Placa del vehículo
      </label>
      <div className="query-bar">
        <span className="plate-country" aria-hidden="true">
          <i />
          <small>PERÚ</small>
        </span>
        <input
          id="plate"
          value={plate}
          onChange={(e) => {
            setPlate(e.target.value);
            setError("");
          }}
          placeholder="XYZ-753"
          maxLength={12}
          autoComplete="off"
          required
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? "plate-hint plate-error" : "plate-hint"}
        />
        <Button type="submit">
          Revisar placa <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
      <p id="plate-hint" className="hint">
        Ingresa una placa real para revisar cobertura. XYZ-753 es solo un ejemplo visual.
      </p>
      {error && (
        <p id="plate-error" role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}
