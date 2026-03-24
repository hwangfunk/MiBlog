export const PageWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`animate-fade-in ${className ?? ""}`}>
      {children}
    </div>
  );
};
