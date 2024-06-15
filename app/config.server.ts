import "@shopify/shopify-app-remix/adapters/node";
import prisma from "./db.server";

export async function getPayConfig({ data }) {
  const config = await prisma.session.findUnique({ 
    where: { shop: data.shop, id: data.id },
    select: { liqPayPublicKey: true, liqPayPrivateKey: true }
  });
  return config;
}

export async function postPayConfig(data) {
  await prisma.session.update({
    where: { shop: data.session.shop, id: data.session.id },
    data: {
      liqPayPublicKey: data.liqPayPublicKey,
      liqPayPrivateKey: data.liqPayPrivateKey,
    },
  });
}

export function validatePayConfig(data) {
  const errors = {};

  if (!data.liqPayPublicKey) {
    errors.liqPayPublicKey = "liqPayPublicKey is required";
  }

  if (!data.liqPayPrivateKey) {
    errors.liqPayPrivateKey = "liqPayPrivateKey is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}
