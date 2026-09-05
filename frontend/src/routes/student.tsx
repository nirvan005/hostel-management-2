import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/StudentShell";

export const Route = createFileRoute("/student")({
  component: StudentShell,
});
