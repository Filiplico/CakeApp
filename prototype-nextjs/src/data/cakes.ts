export type CakeCategory = "Birthday" | "Wedding" | "Kids" | "Celebration";

export type Cake = {
  id: string;
  name: string;
  priceFrom: number;
  category: CakeCategory;
  image: string;
  shortDescription: string;
};

export const cakes: Cake[] = [
  {
    id: "1",
    name: "Chocolate Drip Cake",
    priceFrom: 45,
    category: "Birthday",
    image: "/cakes/choco-drip.jpg",
    shortDescription:
      "Rich chocolate cake with glossy ganache drip and fresh berries. Perfect for chocolate lovers.",
  },
  {
    id: "2",
    name: "Pink Floral Wedding Cake",
    priceFrom: 280,
    category: "Wedding",
    image: "/cakes/pink-floral.jpg",
    shortDescription:
      "Elegant multi-tier vanilla cake with buttercream and delicate sugar flowers. A timeless choice for your big day.",
  },
  {
    id: "3",
    name: "Kids Stars & Sprinkles",
    priceFrom: 38,
    category: "Kids",
    image: "/cakes/kids-stars.jpg",
    shortDescription:
      "Fun vanilla cake with colorful sprinkles and star toppers. Ideal for children's parties.",
  },
];
