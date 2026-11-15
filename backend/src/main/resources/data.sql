-- Sample cakes for the catalogue. Runs on every startup, but only fills an empty table.
INSERT INTO products (name, category, price_from, image_url, short_description, full_description)
SELECT v.name, v.category, v.price_from, v.image_url, v.short_description, v.full_description
FROM (VALUES
    ('Chocolate Birthday Cake', 'BIRTHDAY', 4500,
     'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80',
     'Chocolate sponge with piped buttercream roses and your message.',
     'Moist chocolate sponge layered with chocolate buttercream, finished with a chocolate drip, piped buttercream roses and a handwritten message of your choice. Serves 10 to 12.'),
    ('Vanilla Chocolate Drip', 'CELEBRATION', 5500,
     'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
     'Tall vanilla cake with a dark chocolate drip.',
     'Our signature vanilla sponge in smooth vanilla buttercream, crowned with a dark chocolate drip and chocolate shavings. Simple, striking and made for celebrations. Serves 12 to 14.'),
    ('Strawberry Sprinkle Cake', 'KIDS', 4800,
     'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
     'Funfetti sponge with a pink drip and a sprinkle border.',
     'Vanilla funfetti sponge packed with sprinkles, covered in strawberry buttercream with a pink drip, a sprinkle border and a playful ice-cream cone on top. A party favourite. Serves 8 to 10.'),
    ('Strawberry Cupcakes', 'CUPCAKES', 2400,
     'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
     'Six vanilla cupcakes with strawberry cream.',
     'Six light vanilla cupcakes topped with swirls of strawberry cream, a white chocolate drizzle and fresh strawberries. Perfect for sharing.')
) AS v (name, category, price_from, image_url, short_description, full_description)
WHERE NOT EXISTS (SELECT 1 FROM products);
