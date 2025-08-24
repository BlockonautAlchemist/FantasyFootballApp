interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-600">{subtitle}</p>
    </div>
  );
}
