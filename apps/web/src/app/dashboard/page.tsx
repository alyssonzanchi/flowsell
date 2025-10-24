import { cookies } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import ConnectStore from "./components/ConnectStore";
import { prisma } from "@flowsell/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

type ShopifyOrder = {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

async function getOrders(): Promise<ShopifyOrder[]> {
  const cookieStore = await cookies();

  const cookieString = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(
    "http://localhost:3000/api/server/shopify/orders",
    {
      headers: {
        Cookie: cookieString,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch orders:", await response.text());
    return [];
  }

  const data = (await response.json()) as ShopifyOrder[];
  return data;
}

async function getShopifyStores(userId: string) {
  const userWithStores = await prisma.user.findUnique({
    where: { id: userId },
    include: { shopifyStores: true },
  });
  return userWithStores?.shopifyStores || [];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Você não está autorizado.</div>;
  }

  const stores = await getShopifyStores(session.user.id);

  if (stores.length === 0) {
    return <ConnectStore />;
  }

  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Últimos Pedidos</h1>
      <p className="text-slate-500 mt-2">
        Exibindo os 10 pedidos mais recentes da sua loja.
      </p>

      <Card className="mt-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map((order: ShopifyOrder) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Cliente não informado"}
                    </TableCell>
                    <TableCell>{order.displayFinancialStatus}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: order.totalPriceSet.shopMoney.currencyCode,
                      }).format(
                        parseFloat(order.totalPriceSet.shopMoney.amount)
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
