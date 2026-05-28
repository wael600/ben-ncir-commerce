import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExpiredPage() {
    return (
        <>
            <h1 className="text-4xl mb-4">Download Link Expired</h1>
            <Button asChild size="lg">
                <Link href="/orders">Go Back to Orders</Link>
            </Button>
        </>
    );
}
