import { redirect } from "next/navigation";

export default function ViolationsRedirect() {
  redirect("/dashboard/violations");
}
