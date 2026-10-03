/*!
 * OurtAuto — search-data.js
 * Local dummy dataset for the global search (Ctrl/Cmd+K). No network calls.
 * Paths are root-relative; search.js prepends window.OURT_BASE at render time.
 */
window.OURT_SEARCH_INDEX = [
  { group: "Pages", title: "Master Dashboard", subtitle: "Dashboards / Overview", icon: "bi-speedometer2", url: "index.html" },
  { group: "Pages", title: "Seller Dashboard", subtitle: "Dashboards / Seller", icon: "bi-shop", url: "pages/seller-dashboard.html" },
  { group: "Pages", title: "Dealer Dashboard", subtitle: "Dashboards / Dealer", icon: "bi-building", url: "pages/dealer-dashboard.html" },
  { group: "Pages", title: "Vehicles", subtitle: "Automobiles / Vehicles", icon: "bi-car-front", url: "pages/vehicles/vehicles.html" },
  { group: "Pages", title: "Add Vehicle", subtitle: "Automobiles / Add Vehicle", icon: "bi-plus-square", url: "pages/vehicles/add-vehicle.html" },
  { group: "Pages", title: "Products", subtitle: "Catalog / Products", icon: "bi-box-seam", url: "pages/products/products.html" },
  { group: "Pages", title: "Sellers", subtitle: "Sellers / All Sellers", icon: "bi-people", url: "pages/sellers/sellers.html" },
  { group: "Pages", title: "Customers", subtitle: "Customers / All", icon: "bi-person-lines-fill", url: "pages/customers/customers.html" },
  { group: "Pages", title: "Orders", subtitle: "Orders / All Orders", icon: "bi-receipt", url: "pages/orders/orders.html" },
  { group: "Pages", title: "Leads Pipeline", subtitle: "CRM / Pipeline", icon: "bi-kanban", url: "pages/crm/lead-pipeline.html" },
  { group: "Pages", title: "Test Drives", subtitle: "CRM / Test Drives", icon: "bi-calendar-check", url: "pages/crm/test-drives.html" },
  { group: "Pages", title: "Service Bookings", subtitle: "Service / Bookings", icon: "bi-tools", url: "pages/service/service-bookings.html" },
  { group: "Pages", title: "Inventory", subtitle: "Inventory / Overview", icon: "bi-boxes", url: "pages/inventory/inventory.html" },
  { group: "Pages", title: "Payments", subtitle: "Finance / Payments", icon: "bi-credit-card", url: "pages/finance/payments.html" },
  { group: "Pages", title: "Campaigns", subtitle: "Marketing / Campaigns", icon: "bi-megaphone", url: "pages/marketing/campaigns.html" },
  { group: "Pages", title: "Settings", subtitle: "System / Settings", icon: "bi-gear", url: "pages/system/settings.html" },

  { group: "Vehicles", title: "Honda City ZX", subtitle: "Sedan · New · ₹13.2L", icon: "bi-car-front", url: "pages/vehicles/vehicle-details.html" },
  { group: "Vehicles", title: "Hyundai Creta SX", subtitle: "SUV · New · ₹16.8L", icon: "bi-car-front", url: "pages/vehicles/vehicle-details.html" },
  { group: "Vehicles", title: "Tata Nexon EV", subtitle: "EV · New · ₹14.5L", icon: "bi-car-front", url: "pages/vehicles/vehicle-details.html" },
  { group: "Vehicles", title: "Royal Enfield Classic 350", subtitle: "Bike · New · ₹1.93L", icon: "bi-bicycle", url: "pages/vehicles/vehicle-details.html" },

  { group: "Sellers", title: "AutoHub Delhi", subtitle: "Dealer · 842 listings", icon: "bi-shop", url: "pages/sellers/seller-details.html" },
  { group: "Sellers", title: "Prime Motors Mumbai", subtitle: "Dealer · 614 listings", icon: "bi-shop", url: "pages/sellers/seller-details.html" },
  { group: "Sellers", title: "SpeedZone Bikes", subtitle: "Seller · 312 listings", icon: "bi-shop", url: "pages/sellers/seller-details.html" },

  { group: "Customers", title: "Arjun Mehta", subtitle: "3 orders · Mumbai", icon: "bi-person", url: "pages/customers/customer-details.html" },
  { group: "Customers", title: "Sneha Kapoor", subtitle: "1 order · Delhi", icon: "bi-person", url: "pages/customers/customer-details.html" },
  { group: "Customers", title: "Rahul Verma", subtitle: "5 orders · Bengaluru", icon: "bi-person", url: "pages/customers/customer-details.html" }
];
