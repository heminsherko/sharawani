import { redirect } from "next/navigation";

export default function EdmsRedirect() {
  redirect("/dashboard/documents");
}
