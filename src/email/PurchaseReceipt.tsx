import { Body, Container, Head, Heading, Html, Preview, Tailwind } from "@react-email/components"
import { OrderInformation } from "./component/OrderInformation"

type PurchaseReceiptEmailProps = {
    product: {
        name: string
        imagePath: string
        description: string
    }
    order: {
        id: string
        createdAt: Date
        pricePaidInCents: number
    }
    downloadVerificationId: string
}

PurchaseReceiptEmail.PreviewProps = {
    product: { 
        name: "Product name",
        description: "Product description",
        imagePath: "https://placehold.co/600x400"
    },
    order: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        createdAt: new Date("2026-01-01"),
        pricePaidInCents: 2000
    },
    downloadVerificationId: "123e4567-e89b-12d3-a456-426614174001"
} satisfies PurchaseReceiptEmailProps

export default function PurchaseReceiptEmail({ product, order, downloadVerificationId }: PurchaseReceiptEmailProps) {
    return (
        <Html>
            <Preview>
                Download {product.name} and view receipt
            </Preview>
            <Tailwind>
                <Head />
                <Body className="font-sans bg-white">
                    <Container className="max-w-xl">
                        <Heading>Purchase Receipt</Heading>
                        <OrderInformation order={order} product={product} downloadVerificationId={downloadVerificationId} />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
