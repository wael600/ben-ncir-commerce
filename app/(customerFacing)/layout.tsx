"use client";
import { NavLink } from "../components/Nav";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CustomerFacingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [search, setSearch] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/products?search=${encodeURIComponent(search)}`);
        }
    };

    return (
        <>
            <nav className="bg-orange-500 text-white flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.jpg"
                        alt="Ben Ncir Commerce"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                    />
                    <span className="font-bold text-sm hidden md:block">BEN NCIR COMMERCE</span>
                </div>
                <div className="flex">
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/products">Products</NavLink>
                    <NavLink href="/orders">My Orders</NavLink>
                </div>
                <form onSubmit={handleSearch} className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-white text-black rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
                    />
                </form>
            </nav>
            {children}
        </>
    );
}
