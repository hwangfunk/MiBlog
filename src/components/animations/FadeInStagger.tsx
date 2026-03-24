export const FadeInStagger = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`stagger-children ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
};

export const FadeInStaggerItem = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};
