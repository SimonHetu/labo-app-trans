import prisma from '../lib/prisma';

const demoUserId = 'demo-user-id';

async function main() {
  const products = [
    {
      id: 'Strong coffee',
      name: 'Cafe filtre',
      description: 'Cafe chaud',
      price: '3.99',
      quantity: 2,
    },
    {
      id: 'Good muffin',
      name: 'Muffin bleuets',
      description: 'Muffin aux bleuets',
      price: '4.49',
      quantity: 1,
    },
    {
      id: 'Best sandwich',
      name: 'Sandwich pistache',
      description: 'Sandwich aux pistache',
      price: '8.99',
      quantity: 1,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
      },
    });
  }

  const cart = await prisma.cart.upsert({
    where: { id: 'demo-cart' },
    update: {
      userId: demoUserId,
    },
    create: {
      id: 'demo-cart',
      userId: demoUserId,
    },
  });

  for (const product of products) {
    await prisma.cartItem.upsert({
      where: { id: `demo-cart-item-${product.id}` },
      update: {
        quantity: product.quantity,
        cartId: cart.id,
        productId: product.id,
      },
      create: {
        id: `demo-cart-item-${product.id}`,
        quantity: product.quantity,
        cartId: cart.id,
        productId: product.id,
      },
    });
  }

  console.log(`Seed termine: panier demo cree pour ${demoUserId}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
