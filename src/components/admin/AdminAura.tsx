import type { ReactNode } from "react";

type AdminAuraProps = {
  label?: string;
  children?: ReactNode;
};

export function AdminAura({ label = "Admin Mode", children }: AdminAuraProps) {
  return (
    <div className="admin-aura fixed inset-0 pointer-events-none z-50">
      <div className="admin-aura-ambient" aria-hidden="true" />
      <div className="admin-aura-frame" aria-hidden="true" />
      <div className="admin-border" aria-hidden="true" />
      <div className="admin-mode-dock">
        <div className="admin-mode-badge">
          <span className="admin-mode-badge-dot" aria-hidden="true" />
          <span>{label}</span>
        </div>
        {children ? (
          <div className="admin-mode-actions" role="group" aria-label={`${label} controls`}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
