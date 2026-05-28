import { Button, Column, Img, Row, Section, Text } from "@react-email/components"
import { formatPrice } from "@/lib/formatters"

type OrderInformationProps = {
    order: {
        id: string
        createdAt: Date
        pricePaidInCents: number
    }
    product: {
        name: string
        imagePath: string
        description: string
    }
    downloadVerificationId: string
}

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

export function OrderInformation({ order, product, downloadVerificationId }: OrderInformationProps) {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

    let fixedImagePath = product.imagePath;
    if (fixedImagePath && !fixedImagePath.startsWith("http")) {
        fixedImagePath = fixedImagePath.replace(/^public\//, "").replace(/^\//, "");
        fixedImagePath = `${serverUrl}/${fixedImagePath}`;
    }

    return (
        <>
            <Section>
                <Row>
                    <Column>
                        <Text className="mb-0 text-gray-500 whitespace-nowrap mr-4">Order Id</Text>
                        <Text className="mt-0 mr-4">{order.id}</Text>
                    </Column>
                    <Column>
                        <Text className="mb-0 text-gray-500 whitespace-nowrap mr-4">Purchased On</Text>
                        <Text className="mt-0 mr-4">{dateFormatter.format(new Date(order.createdAt))}</Text>
                    </Column>
                    <Column>
                        <Text className="mb-0 text-gray-500 whitespace-nowrap mr-4">Price Paid</Text>
                        <Text className="mt-0 mr-4">{formatPrice(order.pricePaidInCents / 100)}</Text>
                    </Column>
                </Row>
            </Section>

            <Section className="border rounded-md border-gray-200 p-4 mt-6">
                <Img
                    width="560"
                    height="300"
                    alt={product.name}
                    src={fixedImagePath}
                    style={{ borderRadius: "8px", objectFit: "cover", width: "100%" }}
                />
                <Row className="mt-4">
                    <Column >
                        <Text className="text-2xl font-bold mb-0">{product.name}</Text>
                        <Text className="mt-0 text-gray-500">{product.description}</Text>
                        <Button href={`${process.env.NEXT_PUBLIC_SERVER_URL}/products/download/${downloadVerificationId}`} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-center no-underline">
                            Download Now
                        </Button>
                    </Column>
                </Row>
                
            </Section>
        </>
    )
}