import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  color: string;
  children?: ReactNode; // ✅ acum este opțional
}

export default function SectionCard({ title, color, children }: SectionCardProps) {
  return (
    <div className="p-6 bg-white shadow rounded-xl mb-8">
      <h2 className={`text-xl font-semibold mb-4 ${color}`}>{title}</h2>
      {children && <div>{children}</div>}
    </div>
  );
}
