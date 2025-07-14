"use client";

import React from "react";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CarregandoTable() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: 8 }).map((_, cellIndex) => (
            <TableCell
              key={cellIndex}
              className="truncate overflow-hidden whitespace-nowrap"
            >
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
