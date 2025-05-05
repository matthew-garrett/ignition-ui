import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export const Nav = () => {
  return (
    <nav className="flex items-center gap-4 p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 pl-16 pr-16">
        <LayoutDashboard className="w-8 h-8 text-blue-500" />
        <Link href="/" className="text-lg font-semibold text-black">
          Network Dashboard
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
