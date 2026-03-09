export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  categories: {
    list: "/categories",
    bySlug: (slug: string) => `/categories/${slug}`,
  },
  products: {
    list: "/products",
    bySlug: (slug: string) => `/products/${slug}`,
    reviews: (productId: number | string) => `/products/${productId}/reviews`,
  },
  cart: {
    details: "/cart",
    addItem: "/cart/items",
    item: (productId: number | string) => `/cart/items/${productId}`,
    clear: "/cart",
  },
  wishlist: {
    list: "/wishlist",
    toggle: "/wishlist",
    remove: (productId: number | string) => `/wishlist/${productId}`,
  },
  orders: {
    list: "/orders",
    create: "/orders",
    byNumber: (orderNumber: string) => `/orders/${orderNumber}`,
    cancel: (orderNumber: string) => `/orders/${orderNumber}/cancel`,
  },
  payments: {
    initiate: "/payments/initiate",
    status: (orderNumber: string) => `/payments/${orderNumber}/status`,
  },
  notifications: {
    list: "/notifications",
    unread: "/notifications/unread",
    read: (id: number | string) => `/notifications/${id}/read`,
    readAll: "/notifications/read-all",
    delete: (id: number | string) => `/notifications/${id}`,
  },
  admin: {
    dashboardOverview: "/admin/dashboard/overview",
    dashboardTopProducts: "/admin/dashboard/top-products",
    dashboardRecentOrders: "/admin/dashboard/recent-orders",
    users: "/admin/users",
    userById: (id: number | string) => `/admin/users/${id}`,
    userToggleActive: (id: number | string) =>
      `/admin/users/${id}/toggle-active`,
    userRole: (id: number | string) => `/admin/users/${id}/role`,
    products: "/admin/products",
    productById: (id: number | string) => `/admin/products/${id}`,
    productToggleActive: (id: number | string) =>
      `/admin/products/${id}/toggle-active`,
    productToggleFeatured: (id: number | string) =>
      `/admin/products/${id}/toggle-featured`,
    productDelete: (id: number | string) => `/admin/products/${id}`,
    orders: "/admin/orders",
    orderByNumber: (orderNumber: string) => `/admin/orders/${orderNumber}`,
    orderStatus: (orderNumber: string) => `/admin/orders/${orderNumber}/status`,
    categories: "/admin/categories",
    categoryById: (id: number | string) => `/admin/categories/${id}`,
  },
  vendor: {
    orders: "/vendor/orders",
    products: "/vendor/products",
    productCreate: "/vendor/products",
    productUpdate: (id: number | string) => `/vendor/products/${id}`,
    productDelete: (id: number | string) => `/vendor/products/${id}`,
    productAddImages: (id: number | string) => `/vendor/products/${id}/images`,
    productDeleteImage: (id: number | string, imageId: number | string) =>
      `/vendor/products/${id}/images/${imageId}`,
    productSetPrimaryImage: (id: number | string, imageId: number | string) =>
      `/vendor/products/${id}/images/${imageId}/primary`,
    productAddVideos: (id: number | string) => `/vendor/products/${id}/videos`,
    productDeleteVideo: (id: number | string, videoId: number | string) =>
      `/vendor/products/${id}/videos/${videoId}`,
  },
} as const;
