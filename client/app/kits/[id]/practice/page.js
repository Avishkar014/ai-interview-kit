import AuthGate from "../../../../components/common/AuthGate";
import AppShell from "../../../../components/common/AppShell";
import PracticeSession from "../../../../components/flashcards/PracticeSession";

export default async function PracticePage({ params }) {
  const { id } = await params;
  return <AuthGate><AppShell title="Practice mode" eyebrow="Deliberate practice" description="Work through the cards that need the most attention, one review at a time."><PracticeSession kitId={id} /></AppShell></AuthGate>;
}