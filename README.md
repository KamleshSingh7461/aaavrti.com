# Ournika - Modern Indian Heritage Ecommerce

**Ournika** is a premium e-commerce platform dedicated to authentic Indian heritage and handloom products. It features a "Modern Heritage" aesthetic, bilingual support (English/Hindi), and a seamless shopping experience.

![Ournika Logo](/public/ournika_logo.png)

## 🚀 Features

- **Aesthetic UI**: Custom "Modern Heritage" theme using Tailwind CSS and `Outfit` font.
- **Bilingual Support**: Full English and Hindi (`हि`) localization togglable via the header.
- **Product Browsing**:
  - Dynamic **Product Listing Pages (PLP)** with category filtering.
  - Rich **Product Detail Pages (PDP)** with image galleries and bilingual info.
- **Shopping Cart**:
  - Client-side cart management using **Zustand**.
  - Persists state across sessions.
  - Slide-over Cart Drawer.
- **Checkout & Payments**:
  - Payment integration placeholders (Razorpay).
  - Shipping address form (Shiprocket style).
- **Authentication (Mock)**:
  - Beautiful Login and Signup pages.
  - User Dashboard with Order History.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database (Planned)**: PostgreSQL (Supabase) + Prisma ORM

## 🏃‍♂️ Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/aaavrti.git
    cd aaavrti
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🧪 Testing the Flow

1.  **Switch Language**: Click the `EN/हि` toggle in the top-right header.
2.  **Auth**: Click the User icon -> "Sign In" (Auto-logins as demo user).
3.  **Shop**: Browse "Women" -> "Sarees", add a product to cart.
4.  **Checkout**: Proceed to checkout and click "Pay with Razorpay" to simulate a purchase.

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (ProductCard, CartDrawer, etc.).
- `lib/`: Utilities, Types, and Zustand Stores (`store.ts`, `auth.ts`, `language.ts`).
- `actions/`: Server Actions for fetching data (currently using mock data).
- `public/`: Static assets.

## 📄 License

Private / Proprietary.
