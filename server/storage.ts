import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  coupons,
  feedback,
  type User,
  type UpsertUser,
  type Category,
  type Product,
  type CartItem,
  type Order,
  type OrderItem,
  type Coupon,
  type Feedback,
  type InsertCategory,
  type InsertProduct,
  type InsertCartItem,
  type InsertOrder,
  type InsertOrderItem,
  type InsertCoupon,
  type InsertFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: string, paymentStatus: string, paymentIntentId?: string): Promise<Order>;

  // Coupon operations
  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon>;
  useCoupon(code: string): Promise<Coupon>;

  // Feedback operations
  getFeedback(): Promise<(Feedback & { user: User; order?: Order })[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;

  // Analytics
  getDashboardStats(): Promise<{
    totalOrders: number;
    todayRevenue: number;
    activeProducts: number;
    activeUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.isActive, true)));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.name} ILIKE ${'%' + query + '%'}`
        )
      );
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then((rows) =>
        rows.map((row) => ({
          ...row.cart_items,
          product: row.products,
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.productId, cartItem.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: (existingItem.quantity || 0) + (cartItem.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersQuery = userId 
      ? db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
      : db.select().from(orders).orderBy(desc(orders.createdAt));

    const ordersResult = await ordersQuery;

    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .then((rows) =>
            rows.map((row) => ({
              ...row.order_items,
              product: row.products,
            }))
          );

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id))
      .then((rows) =>
        rows.map((row) => ({
          ...row.order_items,
          product: row.products,
        }))
      );

    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    const newOrderItems = await db.insert(orderItems).values(items).returning();
    return newOrderItems;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrderPaymentStatus(id: string, paymentStatus: string, paymentIntentId?: string): Promise<Order> {
    const updateData: any = { paymentStatus: paymentStatus as any, updatedAt: new Date() };
    if (paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId;
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Coupon operations
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(and(eq(coupons.code, code), eq(coupons.isActive, true)));
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set({ ...coupon, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }

  async useCoupon(code: string): Promise<Coupon> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set({ 
        usageCount: sql`${coupons.usageCount} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(coupons.code, code))
      .returning();
    return updatedCoupon;
  }

  // Feedback operations
  async getFeedback(): Promise<(Feedback & { user: User; order?: Order })[]> {
    return await db
      .select()
      .from(feedback)
      .innerJoin(users, eq(feedback.userId, users.id))
      .leftJoin(orders, eq(feedback.orderId, orders.id))
      .orderBy(desc(feedback.createdAt))
      .then((rows) =>
        rows.map((row) => ({
          ...row.feedback,
          user: row.users,
          order: row.orders || undefined,
        }))
      );
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalOrders: number;
    todayRevenue: number;
    activeProducts: number;
    activeUsers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrdersResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(orders);

    const [todayRevenueResult] = await db
      .select({ 
        revenue: sql`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`.mapWith(Number) 
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${today}`);

    const [activeProductsResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(products)
      .where(eq(products.isActive, true));

    const [activeUsersResult] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(users);

    return {
      totalOrders: totalOrdersResult.count,
      todayRevenue: todayRevenueResult.revenue,
      activeProducts: activeProductsResult.count,
      activeUsers: activeUsersResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
