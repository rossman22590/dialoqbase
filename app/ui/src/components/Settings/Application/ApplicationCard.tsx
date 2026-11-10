// A titled group of settings rows. Each row draws its own top hairline,
// which also separates the first row from the title.
export const ApplicationCard = ({
  children,
  title,
  description,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) => {
  return (
    <section className={`ui-card ${className}`}>
      <div className="px-5 py-3.5">
        <h3 className="m-0 text-[15px] font-semibold text-fg">{title}</h3>
        {description && (
          <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
};
