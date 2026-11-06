# Mom's Cake Studio

A full-stack web application for managing a cake business.  
Customers can browse cakes, customize designs, and place orders.  
The admin can manage products and track orders.  
Includes an AI-powered cake design assistant.

## MVP Features

### Public Website
- Responsive homepage with featured cakes
- Product catalog (dynamic from database)
- Individual cake details page
- Contact page with business information
- Mobile-friendly design

### Cake Customizer
- Choose cake shape (round, square, heart)
- Select number of tiers (1–3)
- Pick base and accent colors
- Choose decoration style (flowers, stars, clouds, minimal)
- Add custom message text
- Live SVG preview updates in real-time
- Custom design saved as structured JSON

### Order System
- Custom order form with:
  - Customer details
  - Pickup/delivery option
  - Date selection
  - Custom description
- Order stored in database
- Order confirmation page

### Admin Dashboard
- Admin authentication
- View all incoming orders
- Change order status (New / In Progress / Completed)
- View saved custom cake configuration
- Manage products (Add / Edit / Delete)

### AI Design Assistant
- User describes event and theme
- AI suggests:
  - Cake shape
  - Number of tiers
  - Colors
  - Decorations
  - Suggested cake message
- Auto-fills customizer fields

## Tech Stack

### Frontend
- React (Vite + TypeScript)
- React Router
- CSS

### Backend

Spring Boot REST API

- GET /api/products
- GET /api/products/{id}
- POST /api/orders

Uses:
- Spring Boot
- Spring Data JPA
- PostgreSQL (Docker)
- Validation
- Global exception handling
