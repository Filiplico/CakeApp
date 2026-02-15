export interface Cake {
  id: string;
  name: string;
  priceFrom: number;
  category: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
}

export const cakes: Cake[] = [
  {
    id: '1',
    name: 'Classic Vanilla Dream',
    priceFrom: 45,
    category: 'Birthday',
    image: 'https://via.placeholder.com/400x300',
    shortDescription: 'Fluffy vanilla sponge with buttercream frosting.',
    fullDescription:
      'Our signature vanilla sponge layered with smooth vanilla buttercream. Perfect for birthdays and celebrations. Made with real vanilla and fresh ingredients. Serves 8–10.',
  },
  {
    id: '2',
    name: 'Chocolate Indulgence',
    priceFrom: 55,
    category: 'Celebration',
    image: 'https://via.placeholder.com/400x300',
    shortDescription: 'Rich dark chocolate cake with ganache.',
    fullDescription:
      'Decadent dark chocolate cake with layers of chocolate ganache and chocolate buttercream. A chocolate lover\'s dream. Serves 8–12.',
  },
  {
    id: '3',
    name: 'Berry Bliss',
    priceFrom: 50,
    category: 'Wedding',
    image: 'https://via.placeholder.com/400x300',
    shortDescription: 'Light sponge with fresh berries and cream.',
    fullDescription:
      'Delicate vanilla sponge filled with fresh seasonal berries and whipped cream. Elegant and refreshing. Ideal for weddings and summer events. Serves 10–14.',
  },
  {
    id: '4',
    name: 'Carrot & Walnut',
    priceFrom: 48,
    category: 'Everyday',
    image: 'https://via.placeholder.com/400x300',
    shortDescription: 'Spiced carrot cake with cream cheese frosting.',
    fullDescription:
      'Moist spiced carrot cake with walnuts and raisins, topped with tangy cream cheese frosting. A comforting classic. Serves 8–10.',
  },
];
