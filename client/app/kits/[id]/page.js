import AuthGate from "../../../components/common/AuthGate";
import AppShell from "../../../components/common/AppShell";
import KitWorkspace from "../../../components/kits/KitWorkspace";

export default async function KitPage({ params }) {
  const { id } = await params;
  return <AuthGate><AppShell title="Interview kit" eyebrow="Preparation workspace" description="Review the role, sharpen your questions, and choose your next practice step."><KitWorkspace kitId={id} /></AppShell></AuthGate>;
}