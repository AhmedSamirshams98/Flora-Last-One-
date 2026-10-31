"use client";
import React from "react";
import ProductDetail from "@/app/components/HomeComponents/products/ProductDetail";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = React.use(params);
  return <ProductDetail id={id} />;
}
