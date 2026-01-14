import { GameShell, GamePage } from "@/components/layout/GameShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameShell>
      <GamePage>
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-10">
          {children}
        </div>
      </GamePage>
    </GameShell>
  );
}
