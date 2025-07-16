"use client";

import { useState } from "react";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import ProtectedRoute from "@/components/ProtectedRoute";

import CampoBoasVindas from "@/components/boasvindas";

export default function Page() {

  return (
    <ProtectedRoute requiredPermission="Usuarios_ver">
      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <CampoBoasVindas />
        </div>
      </div>
    </ProtectedRoute>
  );
}
