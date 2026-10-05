"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string; icon: string; submissions?: boolean };

const NAV: NavItem[] = [
  { href: "/form/dashboard/patients/", label: "Patients", icon: "◫" },
  { href: "/form/dashboard/forms/", label: "Forms", icon: "▤" },
  { href: "/form/dashboard/forms/submissions/", label: "Submissions", icon: "≡", submissions: true },
  { href: "/form/dashboard/jotform-sync/", label: "Integrations", icon: "⛓" },
];

function activeFor(pathname: string, item: NavItem) {
  if (item.submissions) return pathname.startsWith("/form/dashboard/forms/submissions/");
  if (item.label === "Forms") return pathname.startsWith("/form/dashboard/forms/") && !pathname.includes("/submissions/");
  return pathname.startsWith(item.href);
}

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <button className="mobile-menu" type="button" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">☰</button>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">N</div>
          <div><strong>NeuroLinks</strong><span>Clinical Admin</span></div>
        </div>
        <nav>
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className={activeFor(pathname, item) ? "active" : ""}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <details>
            <summary>Admin</summary>
            <Link href="/form/dashboard/vcita-fields/" onClick={() => setOpen(false)}>vcita Matter fields</Link>
            <Link href="/form/dashboard/import/" onClick={() => setOpen(false)}>Historical migration</Link>
          </details>
          <div className="account"><span>{email}</span><form action="/form/api/auth/logout/" method="post"><button type="submit">Sign out</button></form></div>
        </div>
      </aside>
      {open ? <button className="overlay" type="button" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <div className="content">{children}</div>
      <style jsx global>{`
        html,body{margin:0;background:#f6f8fc;color:#0f172a}.admin-shell{min-height:100vh}.sidebar{position:fixed;inset:0 auto 0 0;width:230px;background:#0f1b35;color:#fff;padding:22px 16px;box-sizing:border-box;display:flex;flex-direction:column;z-index:50}.brand{display:flex;gap:11px;align-items:center;padding:4px 8px 22px}.brand-mark{width:34px;height:34px;border-radius:10px;background:#2563eb;display:grid;place-items:center;font-weight:900}.brand strong{display:block;font-size:17px}.brand span{display:block;margin-top:2px;color:#94a3b8;font-size:12px}.sidebar nav{display:grid;gap:5px}.sidebar nav a{display:flex;gap:11px;align-items:center;color:#cbd5e1;text-decoration:none;padding:10px 11px;border-radius:9px;font-weight:650;font-size:14px}.sidebar nav a:hover{background:#17294c;color:#fff}.sidebar nav a.active{background:#2563eb;color:#fff}.nav-icon{width:18px;text-align:center}.sidebar-bottom{margin-top:auto;border-top:1px solid #243553;padding-top:14px}.sidebar-bottom details summary{cursor:pointer;color:#94a3b8;font-size:12px;font-weight:700;padding:8px}.sidebar-bottom details a{display:block;color:#cbd5e1;text-decoration:none;padding:8px;font-size:13px}.account{margin-top:10px;padding:10px 8px 0}.account>span{display:block;color:#94a3b8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.account button{margin-top:8px;border:1px solid #334766;background:transparent;color:#e2e8f0;border-radius:8px;padding:7px 10px;cursor:pointer}.content{margin-left:230px;min-height:100vh;padding:28px 32px;box-sizing:border-box}.mobile-menu{display:none}.overlay{display:none}@media(max-width:820px){.content{margin-left:0;padding:68px 16px 20px}.mobile-menu{display:block;position:fixed;top:14px;left:14px;z-index:70;width:40px;height:40px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;font-size:20px}.sidebar{transform:translateX(-100%);transition:transform .18s ease}.sidebar.open{transform:translateX(0)}.overlay{display:block;position:fixed;inset:0;background:rgba(15,23,42,.35);border:0;z-index:40}}
      `}</style>
    </div>
  );
}
