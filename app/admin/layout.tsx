import { Nav, NavLink } from "../components/Nav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin/login");
}

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>
        <nav className="bg-primary text-primary-foreground flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
                <Image
                    src="/logo.jpg"
                    alt="Ben Ncir Commerce"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                />
                <span className="font-bold text-sm hidden md:block">BEN NCIR COMMERCE</span>
            </div>
            <div className="flex">
                <NavLink href="/admin">Dashboard</NavLink>
                <NavLink href="/admin/products">Products</NavLink>
                <NavLink href="/admin/orders">Sales</NavLink>
                <NavLink href="/admin/users">Customers</NavLink>
            </div>
            <form action={logout}>
                <button type="submit" className="p-4 hover:bg-secondary hover:text-secondary-foreground text-primary-foreground">
                    Logout
                </button>
            </form>
        </nav>
        <div className="container my-6">{children}</div>
    </>
}
