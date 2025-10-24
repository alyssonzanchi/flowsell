"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConnectStore() {
  const [shopName, setShopName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (shopName) {
      const shopDomain = `${shopName.trim()}.myshopify.com`;
      window.location.href = `/api/server/shopify/auth?shop=${shopDomain}`;
    }
  };

  return (
    <div className="flex justify-center items-center pt-16">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Conecte sua Loja Shopify</CardTitle>
          <CardDescription>
            Para começar, insira o nome da sua loja Shopify abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="shopName">Nome da Loja</Label>
                <div className="flex items-center">
                  <Input
                    id="shopName"
                    placeholder="ex: sua-loja-incrivel"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                  />
                  <span className="ml-2 text-gray-500">.myshopify.com</span>
                </div>
              </div>
              <Button type="submit" className="w-full cursor-pointer">
                Conectar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
