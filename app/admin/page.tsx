import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/src/db";
import { formatPrice, formatNumber } from "@/lib/formatters";

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{body}</p>
      </CardContent>
    </Card>
  );
}

async function getSalesData() {
  const orderData = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  await wait(2000)

  return {
    amount: (orderData._sum.pricePaidInCents || 0) / 100,
    numberOfSales: orderData._count,
  };
}
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getUserData() {
  const userCount = await db.user.count();

  const orderData = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
  });

  return {
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeProducts, inactiveProducts] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } })
  ]);

  return {
    activeProducts,
    inactiveProducts,
  };
}

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        title="SALES" 
        subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
        body={formatPrice(salesData.amount)} 
      />
      <DashboardCard 
        title="USERS" 
        subtitle={`${formatPrice(userData.averageValuePerUser)} Average Value Per User`}
        body={formatNumber(userData.userCount)} 
      />
      <DashboardCard 
        title="ACTIVE PRODUCTS" 
        subtitle={`${formatNumber(productData.inactiveProducts)} Inactive products`}
        body={formatNumber(productData.activeProducts)} 
      />
    </div>
  );
}