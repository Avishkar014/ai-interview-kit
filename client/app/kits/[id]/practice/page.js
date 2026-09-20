import AuthGate from "../../../../components/common/AuthGate";
import AppShell from "../../../../components/common/AppShell";
import PracticeSession from "../../../../components/flashcards/PracticeSession";

export default async function PracticePage({ params }) {
  const { id } = await params;
  return <AuthGate><AppShell title="Practice mode" eyebrow="Deliberate practice"><PracticeSession kitId={id} /></AppShell></AuthGate>;
}