interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-text mb-2">{title}</h2>
      <p className="text-textDim">{subtitle}</p>
    </div>
  );
}
