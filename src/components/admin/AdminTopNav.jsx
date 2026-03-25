import { Bell, Menu, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const AdminTopNav = ({ onHamburger }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, user, role } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/20"
      style={{ background: "rgba(22,27,34,0.85)", backdropFilter: "blur(16px)" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onHamburger} className="lg:hidden text-text-muted hover:text-foreground">
          <Menu size={22} />
        </button>
        <span className="text-lg font-display font-bold text-foreground hidden sm:block">School Admin</span>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-muted/30 border border-border/30 rounded-lg px-3 py-2 w-72">
        <Search size={16} className="text-text-muted" />
        <input
          type="text"
          placeholder="Search students, teachers..."
          className="bg-transparent text-foreground font-body text-sm w-full focus:outline-none placeholder:text-text-muted/50"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-text-muted hover:text-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold flex items-center justify-center text-foreground">
            3
          </span>
        </button>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/40 to-cyan/40 flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{initials}</span>
            </div>
            <ChevronDown size={14} className="text-text-muted hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 glass-strong rounded-xl py-2 shadow-xl">
              <div className="px-4 py-2 border-b border-border/20">
                <p className="font-body font-semibold text-foreground text-sm">{user?.name || "User"}</p>
                <p className="font-body text-text-muted text-xs">{user?.email || "No email"}</p>
                <p className="font-body text-text-muted text-xs capitalize mt-1">{role || user?.role}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm font-body text-text-muted hover:text-foreground hover:bg-muted/20 transition-colors">
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopNav;
