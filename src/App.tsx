import React, { useState, useMemo, useEffect, useRef } from "react"
import { collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const updateProductInFirestore = async (productId: string, updatedFields: Partial<InventoryItem>) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      name: updatedFields.Nombre_Producto,
      price: updatedFields.Precio_Venta,
      stock: updatedFields.Stock,
      inStock: updatedFields.Habilitado,
      category: updatedFields.Categoria,
      season: updatedFields.Temporada,
    });
    console.log("Producto actualizado en Firestore con éxito");
  } catch (error) {
    console.error("Error al actualizar en Firestore:", error);
  }
};

export const saveNewProductInFirestore = async (newProduct: InventoryItem) => {
  try {
    await addDoc(collection(db, "products"), {
      name: newProduct.Nombre_Producto,
      price: newProduct.Precio_Venta,
      stock: newProduct.Stock,
      inStock: newProduct.Habilitado,
      category: newProduct.Categoria,
      season: newProduct.Temporada,
      barcode: newProduct.Codigo_Barras,
      cost: newProduct.Costo_Adquisicion,
      saleMode: newProduct.Modalidad_Venta,
      unit: newProduct.Unidad_Medida,
      image: newProduct.Imagen_Url,
    });
    console.log("Nuevo producto guardado en Firestore con éxito");
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
  }
};
// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | "login"
  | "store"
  | "product"
  | "cart"
  | "employee-login"
  | "employee-panel"
  | "admin"

type AuthMode = "login" | "register"
type Season = string
type UserRole = "customer" | "employee" | "admin"
type AdminTab = "overview" | "inventario" | "pedidos" | "cortes" | "fiados" | "egresos" | "analisis"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  season: Season
  images: string[]
  badge?: string
  inStock: boolean
  stock: number
  unitsSold: number
}

interface CartItem {
  productId: number
  qty: number
  saleMode?: "cantidad" | "monto"
  amount?: number
}

interface SaleRecord {
  date: string
  productId: number
  qty: number
  total: number
}

interface DailyCut {
  date: string
  opening: number
  sales: number
  expenses: number
  closing: number
  employee: string
  expected?: number
  actual?: number
  difference?: number
}

interface FiadoClient {
  id: number
  name: string
  address: string
  phone: string
  creditLimit: number
  paymentDeadline: string
  balance: number
}

interface EgresoRecord {
  id: number
  date: string
  type: "consumo-interno" | "gastos-produccion" | "productos-danados"
  description: string
  amount: number
  qty?: number
  productName?: string
}

interface OrderReceipt {
  id: string
  items: CartItem[]
  total: number
  phone?: string
  createdAt?: string
  deadlineTime?: string
}
// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Aceite de Oliva Extra Virgen",
    description:
      "Aceite de oliva prensado en frío, cultivado en nuestra finca local. Aroma afrutado con notas a almendra y hierba fresca. Ideal para aliñar ensaladas, pasta y carnes a la plancha.",
    price: 18.5,
    category: "Despensa",
    season: "Todo el año",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1601704557540-073b6c5e5882?w=600&h=600&fit=crop&auto=format",
    ],
    badge: "Orgánico",
    inStock: true,
    stock: 24,
    unitsSold: 87,
  },
  {
    id: 2,
    name: "Café Molido Artesanal",
    description:
      "Mezcla de granos arábica de origen único, tostado en pequeños lotes cada semana. Notas a chocolate oscuro, caramelo y un final largo. Molienda media, perfecta para prensa francesa o cafetera italiana.",
    price: 24.9,
    category: "Bebidas",
    season: "Todo el año",
    images: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=600&h=600&fit=crop&auto=format",
    ],
    badge: "Más vendido",
    inStock: true,
    stock: 40,
    unitsSold: 152,
  },
  {
    id: 3,
    name: "Miel de Abeja Pura",
    description:
      "Miel cruda sin pasteurizar, directamente del colmenar. Color ámbar oscuro con aroma floral intenso. Rico en antioxidantes, enzimas y propóleos naturales. Presentación de 500 g.",
    price: 14.0,
    category: "Despensa",
    season: "Verano",
    images: [
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=600&fit=crop&auto=format",
    ],
    inStock: true,
    stock: 18,
    unitsSold: 63,
  },
  {
    id: 4,
    name: "Vino Tinto",
    description:
      "Tempranillo envejecido 14 meses en barrica de roble americano. Copa de color rubí intenso, con taninos sedosos y aromas a frutos rojos, vainilla y especias. Temperatura de servicio: 16-18 °C.",
    price: 32.0,
    category: "Bebidas",
    season: "Otoño",
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&h=600&fit=crop&auto=format",
    ],
    badge: "Selección",
    inStock: true,
    stock: 12,
    unitsSold: 48,
  },
  {
    id: 5,
    name: "Queso Manchego Curado",
    description:
      "Queso de oveja manchega con 6 meses de curación. Textura compacta y sabor intenso con ligero picante. Corteza natural rayada. Perfecto con membrillo y frutos secos. Peso aproximado: 300 g.",
    price: 11.5,
    category: "Lácteos",
    season: "Todo el año",
    images: [
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&h=600&fit=crop&auto=format",
    ],
    inStock: false,
    stock: 0,
    unitsSold: 35,
  },
  {
    id: 6,
    name: "Mermelada de Fresa",
    description:
      "Elaborada con fresas recogidas en temporada, cocidas a fuego lento con azúcar de caña y un toque de limón. Sin conservantes artificiales. Ideal para tostadas, yogur o como relleno de repostería.",
    price: 8.75,
    category: "Despensa",
    season: "Primavera",
    images: [
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=600&fit=crop&auto=format",
    ],
    inStock: true,
    stock: 30,
    unitsSold: 71,
  },
  {
    id: 7,
    name: "Té Verde Premium",
    description:
      "Hojas enteras de té verde japonés Sencha, cosechadas en primera recolección (Ichiban). Sabor fresco, ligeramente vegetal con dulzor natural. Caja de 20 sobres compostables.",
    price: 16.0,
    category: "Bebidas",
    season: "Primavera",
    images: [
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop&auto=format",
    ],
    badge: "Nuevo",
    inStock: true,
    stock: 22,
    unitsSold: 29,
  },
  {
    id: 8,
    name: "Pasta Artesanal Italiana",
    description:
      "Pasta de sémola de trigo duro, extruida en bronce y secada lentamente a baja temperatura. Textura rugosa que retiene las salsas. Disponible en formatos: rigatoni, penne y linguine. 500 g.",
    price: 7.4,
    category: "Despensa",
    season: "Todo el año",
    images: [
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&h=600&fit=crop&auto=format",
    ],
    inStock: true,
    stock: 55,
    unitsSold: 94,
  },
  {
    id: 9,
    name: "Pan de Masa Madre",
    description:
      "Pan artesanal elaborado con masa madre activa de 3 años de antigüedad, harina integral de trigo y centeno. Corteza crujiente, miga alveolada. Horneado cada mañana de martes a domingo.",
    price: 6.5,
    category: "Panadería",
    season: "Todo el año",
    images: [
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&h=600&fit=crop&auto=format",
    ],
    badge: "Fresco",
    inStock: true,
    stock: 8,
    unitsSold: 210,
  },
  {
    id: 10,
    name: "Leche Entera Fresca",
    description:
      "Leche entera de vaca pasteurizada, proveniente de ganadería local en libre pastoreo. Sin homogeneizar. Se recomienda agitar antes de consumir. Botella de vidrio retornable de 1 litro.",
    price: 3.2,
    category: "Lácteos",
    season: "Todo el año",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=600&fit=crop&auto=format",
    ],
    inStock: true,
    stock: 35,
    unitsSold: 180,
  },
  {
    id: 11,
    name: "Canasta de Verduras de Temporada",
    description:
      "Selección semanal de verduras frescas cultivadas a menos de 50 km de la tienda. Esta semana: espinacas baby, zanahorias moradas, remolacha, puerros y tomates cherry. Aproximadamente 2 kg.",
    price: 19.9,
    category: "Frutas y Verduras",
    season: "Verano",
    images: [
      "https://images.unsplash.com/photo-1576181456177-2b99ac0aa1ef?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=600&h=600&fit=crop&auto=format",
    ],
    badge: "Local",
    inStock: true,
    stock: 15,
    unitsSold: 58,
  },
  {
    id: 12,
    name: "Chocolate Negro 72%",
    description:
      "Tableta de chocolate negro con 72% de cacao de origen único de Ecuador. Notas a frutos rojos, madera tostada y un final ligeramente amargo. Elaborado sin lecitina de soja. 80 g.",
    price: 5.9,
    category: "Despensa",
    season: "Invierno",
    images: [
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&h=600&fit=crop&auto=format",
    ],
    inStock: true,
    stock: 42,
    unitsSold: 76,
  },
]

const MOCK_SALES: SaleRecord[] = [
  { date: "2026-08-01", productId: 2, qty: 5, total: 124.5 },
  { date: "2026-08-03", productId: 9, qty: 12, total: 78.0 },
  { date: "2026-08-05", productId: 1, qty: 3, total: 55.5 },
  { date: "2026-08-08", productId: 4, qty: 2, total: 64.0 },
  { date: "2026-08-10", productId: 11, qty: 6, total: 119.4 },
  { date: "2026-08-12", productId: 8, qty: 8, total: 59.2 },
  { date: "2026-08-15", productId: 2, qty: 7, total: 174.3 },
  { date: "2026-08-18", productId: 6, qty: 10, total: 87.5 },
  { date: "2026-08-20", productId: 3, qty: 4, total: 56.0 },
  { date: "2026-08-22", productId: 10, qty: 20, total: 64.0 },
  { date: "2026-08-25", productId: 9, qty: 9, total: 58.5 },
  { date: "2026-08-28", productId: 7, qty: 5, total: 80.0 },
  { date: "2026-09-01", productId: 1, qty: 4, total: 74.0 },
  { date: "2026-09-02", productId: 12, qty: 11, total: 64.9 },
  { date: "2026-09-03", productId: 4, qty: 3, total: 96.0 },
]

const MOCK_DAILY_CUTS: DailyCut[] = [
  { date: "2026-09-01", opening: 500, sales: 248.5, expenses: 45.0, closing: 703.5, employee: "Carlos M." },
  { date: "2026-09-02", opening: 703.5, sales: 189.3, expenses: 30.0, closing: 862.8, employee: "Laura R." },
  { date: "2026-09-03", opening: 862.8, sales: 312.7, expenses: 55.5, closing: 1120.0, employee: "Carlos M." },
  { date: "2026-09-04", opening: 1120.0, sales: 176.9, expenses: 22.0, closing: 1274.9, employee: "Ana V." },
]

const MOCK_FIADOS: FiadoClient[] = [
  { id: 1, name: "Roberto Salinas", address: "Calle Hidalgo 45", phone: "555-2341", creditLimit: 500, paymentDeadline: "2026-09-15", balance: 180.5 },
  { id: 2, name: "María de la Cruz", address: "Av. Juárez 12, Int. 3", phone: "555-8892", creditLimit: 300, paymentDeadline: "2026-09-20", balance: 95.0 },
  { id: 3, name: "Familia Gutiérrez", address: "Privada Rosal 8", phone: "555-4411", creditLimit: 800, paymentDeadline: "2026-09-30", balance: 340.0 },
]

const MOCK_EGRESOS: EgresoRecord[] = [
  { id: 1, date: "2026-08-05", type: "consumo-interno", description: "Desayuno personal tienda", amount: 85.0 },
  { id: 2, date: "2026-08-10", type: "gastos-produccion", description: "Bolsas y empaques para panadería", amount: 120.0 },
  { id: 3, date: "2026-08-12", type: "productos-danados", description: "Pan de masa madre caducado", amount: 39.0, qty: 6, productName: "Pan de Masa Madre" },
  { id: 4, date: "2026-08-18", type: "consumo-interno", description: "Café y galletas staff", amount: 45.5 },
  { id: 5, date: "2026-08-22", type: "productos-danados", description: "Mermelada fermentada", amount: 26.25, qty: 3, productName: "Mermelada de Fresa" },
  { id: 6, date: "2026-08-25", type: "gastos-produccion", description: "Cinta adhesiva y etiquetas", amount: 55.0 },
  { id: 7, date: "2026-09-01", type: "consumo-interno", description: "Comida equipo – frutas y lácteos", amount: 112.0 },
  { id: 8, date: "2026-09-02", type: "productos-danados", description: "Verduras dañadas por frío", amount: 59.7, qty: 3, productName: "Canasta de Verduras" },
  { id: 9, date: "2026-09-03", type: "gastos-produccion", description: "Gas para hornos panadería", amount: 180.0 },
]

const CATEGORIES = [
  "Todas",
  "Despensa",
  "Bebidas",
  "Lácteos",
  "Panadería",
  "Frutas y Verduras",
]
const SEASONS: Season[] = [
  "Todo el año",
  "Primavera",
  "Verano",
  "Otoño",
  "Invierno",
]

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconCart = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
    />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 10a4 4 0 0 1-8 0"
    />
  </svg>
)
const IconX = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const IconSearch = ({ className = "w-4 h-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)
const IconChevronLeft = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
  </svg>
)
const IconStore = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
    />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const IconChart = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const IconUser = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
const IconCheck = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconWarning = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
)
const IconPackage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12 3-9 4.5V16L12 21l9-5.5V7.5L12 3z"
    />
    <polyline points="12 12 3 7.5" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <polyline points="12 12 21 7.5" />
  </svg>
)
const IconFilter = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)
const IconCash = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)
const IconScissors = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
)
const IconPlus = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconBell = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IconTrash = ({ className = "w-4 h-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)
const IconCredit = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toFixed(2)}`

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {

  const addProduct = async () => {
    try {
      await addDoc(collection(db, "products"), {
        name: "Aceite de Oliva",
        price: 18.5,
        stock: 10,
        inStock: true,
        category: "Despensa",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop&auto=format"
      });
      console.log("Producto guardado con éxito");
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  useEffect(() => {
    // Escuchar cambios en la colección "products" de Firestore en tiempo real
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const docsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Id_Producto: doc.id,
          Nombre_Producto: data.name || "Sin nombre",
          Codigo_Barras: data.barcode || "0000000000000",
          Costo_Adquisicion: Number(data.cost) || 0,
          Precio_Venta: Number(data.price) || 0,
          Descripcion: data.description || "",
          Habilitado: data.inStock ?? true,
          Categoria: data.category || "Abarrotes",
          Stock: Number(data.stock) || 0,
          Modalidad_Venta: (data.saleMode as "Pieza" | "Granel") || "Pieza",
          Unidad_Medida: (data.unit as "pz" | "kg" | "lt" | "g") || "pz",
          Imagen_Url: data.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop&auto=format",
          Temporada: data.season || "Todo el año",
        } as InventoryItem;
      });

      // Si Firestore tiene productos guardados, actualizamos el inventario
      if (docsData.length > 0) {
        setInventory(docsData);
      }
    });

    return () => unsubscribe();
  }, []);

  const [view, setView] = useState<View>("login")
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [userRole, setUserRole] = useState<UserRole>("customer")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showProfile, setShowProfile] = useState(false)
  const [bulkProductId, setBulkProductId] = useState<number | null>(null)
  const [bulkMode, setBulkMode] = useState<"cantidad" | "monto">("cantidad")
  const [bulkValue, setBulkValue] = useState("")
  const [seasons, setSeasons] = useState<SeasonAccount[]>([
    { Id_Temporada: "TEMP-001", Nombre_Temporada: "Todo el año", Costo_Insumos: 0, Ventas_Temporada: 0, Ganancia_Neta: 0 },
    { Id_Temporada: "TEMP-002", Nombre_Temporada: "Día de Muertos", Costo_Insumos: 2850, Ventas_Temporada: 4960, Ganancia_Neta: 2110 },
    { Id_Temporada: "TEMP-003", Nombre_Temporada: "Navidad", Costo_Insumos: 4100, Ventas_Temporada: 6820, Ganancia_Neta: 2720 },
  ])
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    PRODUCTS.map((p, index) => ({
      Id_Producto: `PR-${String(index + 1).padStart(3, "0")}`,
      Nombre_Producto: p.name,
      Codigo_Barras: `750105530${String(index + 1).padStart(4, "0")}`,
      Costo_Adquisicion: Number((p.price / 1.3).toFixed(2)),
      Precio_Venta: p.price,
      Descripcion: p.description,
      Habilitado: p.inStock,
      Categoria: ["Bebidas", "Lácteos", "Panadería", "Frutas y Verduras"].includes(p.category) ? p.category : "Abarrotes",
      Stock: p.stock,
      Modalidad_Venta: p.category === "Frutas y Verduras" ? "Granel" : "Pieza",
      Unidad_Medida: p.category === "Frutas y Verduras" ? "kg" : "pz",
      Imagen_Url: p.images[0] || "",
      Temporada: p.season === "Todo el año" ? "Todo el año" : index % 2 ? "Navidad" : "Día de Muertos",
    })),
  )
  const [users, setUsers] = useState<CreditUser[]>([
    ...MOCK_FIADOS.map((f, index) => ({ Id_Usuario: `USR-${101 + index}`, Nombre_Completo: f.name, Telefono: f.phone, Direccion: f.address, Contraseña: "••••••••", Rol: "Cliente" as const, Codigo_Seguridad: String(2468 + index), Estado: "Activo" as const })),
    { Id_Usuario: "USR-200", Nombre_Completo: "Consumidor SGAG", Telefono: localStorage.getItem("tienda_customer_phone") || "", Direccion: "", Contraseña: "••••", Rol: "Cliente", Codigo_Seguridad: "1234", Estado: "Activo" },
  ])
  const [credits, setCredits] = useState<CreditAccount[]>(() => MOCK_FIADOS.map((f, index) => ({ Id_Fiado: `F-${String(index + 1).padStart(3, "0")}`, Id_Usuario: `USR-${101 + index}`, Limite_Credito: f.creditLimit, Saldo_Deudor: f.balance, Fecha_Limite_Pago: f.paymentDeadline, Estado_Credito: "Activo" })))
  const [creditHistory, setCreditHistory] = useState<CreditMovement[]>([])
  const [orders, setOrders] = useState<AdminSale[]>(() => MOCK_SALES.slice(0, 8).map((sale, index) => ({ Id_folio_Venta: `V-${String(index + 1).padStart(4, "0")}`, Id_Usuario: `USR-${101 + (index % 3)}`, total_Pagar: sale.total, estado: index < 3 ? "Pendiente" : "Completado", horario_Recoleccion: index < 3 ? `${10 + index}:30–${11 + index}:00 (30 min)` : "Recogido", fecha_Hora: `${sale.date} ${10 + index}:00`, Telefono: MOCK_FIADOS[index % 3].phone })))
  const [orderDetails, setOrderDetails] = useState<SaleDetail3NF[]>(() => MOCK_SALES.slice(0, 8).map((sale, index) => ({ Id_Folio_Venta: `V-${String(index + 1).padStart(4, "0")}`, Id_Producto: `PR-${String(sale.productId).padStart(3, "0")}`, Cantidad: sale.qty, Precio_Venta_Historico: Number((sale.total / sale.qty).toFixed(2)) })))
  const [dailyCuts, setDailyCuts] = useState<DailyCut[]>(MOCK_DAILY_CUTS)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])
  useEffect(() => {
    const timer = window.setInterval(() => {
      const expired = orders.filter((order) => order.estado === "Pendiente" && order.Id_folio_Venta.startsWith("#MV-") && Date.now() - new Date(order.fecha_Hora).getTime() >= 30 * 60 * 1000)
      if (!expired.length) return
      const expiredIds = new Set(expired.map((order) => order.Id_folio_Venta))
      setOrders((rows) => rows.map((order) => expiredIds.has(order.Id_folio_Venta) ? { ...order, estado: "Cancelado" } : order))
      setInventory((rows) => rows.map((stock) => {
        const restored = orderDetails.filter((detail) => expiredIds.has(detail.Id_Folio_Venta) && detail.Id_Producto === stock.Id_Producto).reduce((sum, detail) => sum + detail.Cantidad, 0)
        return restored ? { ...stock, Stock: Number((stock.Stock + restored).toFixed(3)) } : stock
      }))
    }, 60000)
    return () => window.clearInterval(timer)
  }, [orders, orderDetails])

  // NUEVO: Estado del recibo persistente
  const [pendingOrder, setPendingOrder] = useState<OrderReceipt | null>(() => {
    const saved = localStorage.getItem("tienda_receipt")
    return saved ? JSON.parse(saved) : null
  })
  // NUEVO: Guardar recibo en el navegador automáticamente
  useEffect(() => {
    if (pendingOrder) {
      localStorage.setItem("tienda_receipt", JSON.stringify(pendingOrder))
    } else {
      localStorage.removeItem("tienda_receipt")
    }
  }, [pendingOrder])

  // Auth fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState(() => localStorage.getItem("tienda_customer_phone") || "")
  const [authError, setAuthError] = useState("")

  // Filters
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("Todas")
  const [filterSeason, setFilterSeason] = useState("")
  const [filterAvail, setFilterAvail] = useState<"" | "disponible" | "agotado">(
    "",
  )
  const [priceMax, setPriceMax] = useState(100)
  // Cart sidebar
  const [cartOpen, setCartOpen] = useState(false)

  // Dashboard tab
  const [dashTab, setDashTab] = useState<"ventas" | "inventario" | "ganancias">(
    "ventas",
  )

  // ── Cart helpers ──────────────────────────────────────────────────────────

  const storeProducts = useMemo<Product[]>(() => inventory.map((item) => ({
    id: Number(item.Id_Producto.replace(/\D/g, "")),
    name: item.Nombre_Producto,
    description: item.Descripcion,
    price: item.Precio_Venta,
    category: item.Categoria,
    season: item.Temporada,
    images: [item.Imagen_Url],
    inStock: item.Habilitado && item.Stock > 0,
    stock: item.Stock,
    unitsSold: 0,
  })), [inventory])
  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const totalPrice = cart.reduce((s, i) => {
    const p = storeProducts.find((product) => product.id === i.productId)
    return s + (i.amount ?? (p?.price ?? 0) * i.qty)
  }, 0)

  const addToCart = (id: number) => {
    const stockItem = inventory.find((item) => Number(item.Id_Producto.replace(/\D/g, "")) === id)
    if (stockItem?.Modalidad_Venta === "Granel") {
      setBulkProductId(id)
      setBulkValue("")
      return
    }
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === id)
      if (exists)
        return prev.map((i) =>
          i.productId === id ? { ...i, qty: i.qty + 1 } : i,
        )
      return [...prev, { productId: id, qty: 1 }]
    })
  }

  const removeFromCart = (id: number) =>
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === id)
      if (!exists) return prev
      if (exists.qty <= 1) return prev.filter((i) => i.productId !== id)
      return prev.map((i) =>
        i.productId === id ? { ...i, qty: i.qty - 1 } : i,
      )
    })

  const getQty = (id: number) => cart.find((i) => i.productId === id)?.qty ?? 0

  // ── Auth ─────────────────────────────────────────────────────────────────

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setAuthError("Completa todos los campos.")
      return
    }
    if (authMode === "register" && !name) {
      setAuthError("Ingresa tu nombre.")
      return
    }
    if (authMode === "register" && !/^\d{10}$/.test(phone)) {
      setAuthError("Ingresa un número telefónico de 10 dígitos.")
      return
    }
    if (password.length < 4) {
      setAuthError("La contraseña debe tener al menos 4 caracteres.")
      return
    }
    setAuthError("")
    if (authMode === "register") {
      localStorage.setItem("tienda_customer_phone", phone)
      setUsers((rows) => rows.map((user) => user.Id_Usuario === "USR-200" ? { ...user, Nombre_Completo: name, Telefono: phone, Contraseña: password } : user))
    }
    if (email === "admin@tienda.com") { setUserRole("admin"); setView("admin"); return }
    if (email === "empleado@tienda.com") { setUserRole("employee"); setView("employee-panel"); return }
    setUserRole("customer"); setView("store")
  }

  // ── Filtered products ─────────────────────────────────────────────────────

  const filtered = useMemo(
    () =>
      storeProducts.filter((p) => {
        if (filterCategory !== "Todas" && p.category !== filterCategory)
          return false
        if (filterSeason && p.season !== filterSeason) return false
        if (filterAvail === "disponible" && !p.inStock) return false
        if (filterAvail === "agotado" && p.inStock) return false
        if (p.price > priceMax) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
          return false
        return true
      }),
    [storeProducts, filterCategory, filterSeason, filterAvail, priceMax, search],
  )

  const activeFilterCount = [
    filterCategory !== "Todas",
    filterSeason !== "",
    filterAvail !== "",
    priceMax < 100,
  ].filter(Boolean).length

  // ── Navigation helpers ────────────────────────────────────────────────────

  const openProduct = (p: Product) => {
    setSelectedProduct(p)
    setView("product")
  }
  const goStore = () => setView("store")

  // ─── Renders ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        background: "var(--color-background)",
      }}
      className="min-h-full"
    >
      <button
        type="button"
        onClick={() => setIsOffline((current) => !current)}
        className="fixed top-160 left-1 z-[50] rounded-xl px-3 py-2 text-xs font-bold shadow-lg"
        style={{ background: isOffline ? "#991b1b" : "var(--color-card)", color: isOffline ? "#ffffff" : "var(--color-foreground)", border: "1px solid var(--color-border)" }}
      >
        📡 Simular caída de red: {isOffline ? "SIN RED" : "En línea"}
      </button>

      {/* ── LOGIN / REGISTER ─────────────────────────────────────────────────── */}
      {view === "login" && (
        <div className="min-h-screen grid lg:grid-cols-2">
          <div className="hidden lg:block relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=1200&fit=crop&auto=format"
              alt="Sistema Gestor de Abarrotes González"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #1a1714bb 0%, #c85c2a55 100%)",
              }}
            />
            <div className="absolute bottom-12 left-10 right-10 text-white">
              <p
                className="text-4xl font-bold leading-tight mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Lo mejor de
                <br />
                nuestra tienda,
                <br />
                ahora en línea.
              </p>
              <p className="text-white/70 text-sm">
                Más de 200 productos seleccionados para ti. Haz tu pedido y
                recógelo en tienda.
              </p>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center px-8 py-12"
            style={{ background: "var(--color-background)" }}
          >
            <div className="w-full max-w-sm">
              <div className="flex items-center gap-2 mb-10">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base"
                  style={{ background: "var(--color-primary)" }}
                >
                  M
                </div>
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Abarrotes González
                </span>
              </div>

              <div
                className="flex gap-1 p-1 rounded-xl mb-8"
                style={{ background: "var(--color-secondary)" }}
              >
                {(["login", "register"] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setAuthMode(m)
                      setAuthError("")
                    }}
                    className="flex-1 py-2 rounded-lg text-sm font-700 transition-all"
                    style={
                      authMode === m
                        ? {
                          background: "var(--color-card)",
                          color: "var(--color-primary)",
                          boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                        }
                        : { color: "var(--color-muted-foreground)" }
                    }
                  >
                    {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </button>
                ))}
              </div>

              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-foreground)",
                }}
              >
                {authMode === "login"
                  ? "Bienvenido de vuelta"
                  : "Crea tu cuenta"}
              </h1>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {authMode === "login"
                  ? "Ingresa tus datos para continuar."
                  : "Regístrate gratis y empieza a comprar."}
              </p>

              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                {authMode === "register" && (
                  <>
                    <Field label="Nombre completo">
                      <Input
                        type="text"
                        placeholder="Ana García"
                        value={name}
                        onChange={setName}
                      />
                    </Field>
                    <Field label="Número telefónico">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        placeholder="4779103913"
                        value={phone}
                        onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))}
                      />
                    </Field>
                  </>
                )}
                <Field label="Correo electrónico">
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={setEmail}
                  />
                </Field>
                <Field label="Contraseña">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                  />
                </Field>

                {authError && (
                  <p
                    className="text-xs px-3 py-2 rounded-xl"
                    style={{ color: "#c85c2a", background: "#fdf0ea" }}
                  >
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-1 py-3 rounded-xl font-700 text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "var(--color-primary)", color: "#fff" }}
                >
                  {authMode === "login" ? "Ingresar" : "Crear cuenta"}
                </button>
              </form>

              <p
                className="mt-4 text-xs text-center"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {authMode === "login"
                  ? "¿No tienes cuenta? "
                  : "¿Ya tienes cuenta? "}
                <button
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login")
                    setAuthError("")
                  }}
                  className="font-700"
                  style={{ color: "var(--color-primary)" }}
                >
                  {authMode === "login" ? "Regístrate" : "Inicia sesión"}
                </button>
              </p>

              <div className="mt-4 pt-4 border-t text-[11px]" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
                <p className="font-700 mb-1">Accesos de demostración:</p>
                <p>👤 <strong>admin@tienda.com</strong> → Panel Administrador</p>
                <p className="mt-0.5">🧑‍💼 <strong>empleado@tienda.com</strong> → Panel Empleado</p>
                <p className="mt-0.5">📦 Cualquier otro correo → Tienda cliente</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STORE ────────────────────────────────────────────────────────────── */}
      {(view === "store" || view === "product") && (
        <>
          {/* Sticky header */}
          <header
            className="sticky top-0 z-40 border-b"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
              <button
                onClick={goStore}
                className="flex items-center gap-2 shrink-0"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ background: "var(--color-primary)" }}
                >
                  M
                </div>
                <span
                  className="font-bold text-base hidden sm:block"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Abarrotes González
                </span>
              </button>

              {view === "store" && (
                <div className="flex-1 max-w-md relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--color-secondary)",
                      border: "1.5px solid transparent",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-foreground)",
                    }}
                    onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--color-primary)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "transparent")
                    }
                  />
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={addProduct}
                  className="rounded-xl px-3 py-2 text-xs font-bold transition hover:opacity-90"
                  style={{ background: "#1a7a45", color: "#ffffff" }}
                >
                  🔥 Probar Firebase
                </button>
                {view === "store" && (
                  <button
                    onClick={() => setShowProfile(true)}
                    className="rounded-xl px-3 py-2 text-xs font-bold"
                    style={{ background: "var(--color-secondary)", color: "var(--color-secondary-foreground)" }}
                  >
                    👤 Mi Perfil
                  </button>
                )}
                {/* NUEVO: Botón de recibo activo */}
                {pendingOrder && (
                  <button
                    onClick={() => {
                      setOrderPlaced(true)
                      setView("cart")
                    }}
                    className="flex items-center gap-1.5 text-xs font-700 px-3 py-2 rounded-xl transition hover:opacity-90"
                    style={{ background: "var(--color-primary)", color: "#fff" }}
                  >
                    <IconPackage className="w-4 h-4" /> Recibo activo
                  </button>
                )}

                {/* Cart button — always visible */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 rounded-xl transition hover:bg-[var(--color-secondary)]"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <IconCart />
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-800 flex items-center justify-center text-white"
                      style={{ background: "var(--color-primary)" }}
                    >
                      {totalItems}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl transition hover:bg-[var(--color-secondary)]"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <IconUser className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </header>
          {isOffline && (
            <div className="border-b border-red-300 bg-red-50 px-5 py-3 text-center text-sm font-bold text-red-800">
              ⚠️ Servicio no disponible: La tienda en línea está temporalmente fuera de servicio por falla de conexión con el servidor. Intenta más tarde
            </div>
          )}

          {/* ── Product detail ─────────────────────────────────────────── */}
          {view === "product" && selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              qty={getQty(selectedProduct.id)}
              onAdd={() => addToCart(selectedProduct.id)}
              onRemove={() => removeFromCart(selectedProduct.id)}
              onBack={goStore}
              disabled={isOffline}
            />
          )}

          {/* ── Store catalog ──────────────────────────────────────────── */}
          {view === "store" && (
            <>
              {/* Hero */}
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=400&fit=crop&auto=format"
                  alt="Abarrotes González"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg,#1a1714cc 0%,#1a171440 60%,transparent 100%)",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-center px-8 max-w-6xl mx-auto">
                  <p className="text-white/70 text-xs font-700 uppercase tracking-widest mb-1">
                    Tienda Virtual
                  </p>
                  <h2
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Nuestros productos,
                    <br />
                    en tu puerta.
                  </h2>
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-5 py-6">
                {/* Filter bar */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  {/* Category pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterCategory(c)}
                        className="px-3 py-1.5 rounded-full text-xs font-700 transition"
                        style={
                          filterCategory === c
                            ? {
                              background: "var(--color-foreground)",
                              color: "var(--color-background)",
                            }
                            : {
                              background: "var(--color-secondary)",
                              color: "var(--color-secondary-foreground)",
                            }
                        }
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <span
                    className="ml-auto text-xs"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {filtered.length} resultado
                    {filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Advanced filter panel */}
                <div
                  className="mb-5 p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-4"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  {/* Season */}
                  <div>
                    <p
                      className="text-[10px] font-700 uppercase tracking-widest mb-2"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Temporada
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFilterSeason("")}
                        className="px-3 py-1 rounded-lg text-xs font-600 transition"
                        style={
                          filterSeason === ""
                            ? {
                              background: "var(--color-accent)",
                              color: "var(--color-accent-foreground)",
                            }
                            : {
                              background: "var(--color-secondary)",
                              color: "var(--color-secondary-foreground)",
                            }
                        }
                      >
                        Todas
                      </button>
                      {seasons.map((season) => season.Nombre_Temporada).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFilterSeason(s)}
                          className="px-3 py-1 rounded-lg text-xs font-600 transition"
                          style={
                            filterSeason === s
                              ? {
                                background: "var(--color-accent)",
                                color: "var(--color-accent-foreground)",
                              }
                              : {
                                background: "var(--color-secondary)",
                                color: "var(--color-secondary-foreground)",
                              }
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <p
                      className="text-[10px] font-700 uppercase tracking-widest mb-2"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Disponibilidad
                    </p>
                    <div className="flex gap-1.5">
                      {([
                        ["", "Todos"],
                        ["disponible", "Disponible"],
                        ["agotado", "Agotado"],
                      ] as const).map(([v, l]) => (
                        <button
                          key={v}
                          onClick={() => setFilterAvail(v)}
                          className="px-3 py-1 rounded-lg text-xs font-600 transition"
                          style={
                            filterAvail === v
                              ? {
                                background: "var(--color-accent)",
                                color: "var(--color-accent-foreground)",
                              }
                              : {
                                background: "var(--color-secondary)",
                                color: "var(--color-secondary-foreground)",
                              }
                          }
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <p
                      className="text-[10px] font-700 uppercase tracking-widest mb-2"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Precio máximo:{" "}
                      <span style={{ color: "var(--color-primary)" }}>
                        {fmt(priceMax)}
                      </span>
                    </p>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-[var(--color-primary)]"
                    />
                    <div
                      className="flex justify-between text-[10px] mt-1"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      <span>$5</span>
                      <span>$100</span>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-20"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    <p className="text-lg font-600">Sin resultados</p>
                    <p className="text-sm mt-1">
                      Prueba ajustando los filtros de búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        qty={getQty(p.id)}
                        onAdd={() => addToCart(p.id)}
                        onRemove={() => removeFromCart(p.id)}
                        onOpen={() => openProduct(p)}
                        disabled={isOffline}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Cart Sidebar ───────────────────────────────────────────── */}
          {cartOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setCartOpen(false)}
              />
              <aside
                className="fixed top-0 right-0 z-50 h-full w-80 flex flex-col shadow-2xl"
                style={{ background: "var(--color-card)" }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-2">
                    <IconCart className="w-5 h-5" />
                    <h3
                      className="font-bold"
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--color-foreground)",
                      }}
                    >
                      Mi Carrito
                    </h3>
                    {totalItems > 0 && (
                      <span
                        className="text-xs font-700 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--color-primary)",
                          color: "#fff",
                        }}
                      >
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1 rounded-lg transition hover:bg-[var(--color-secondary)]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    <IconX />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                  {cart.length === 0 ? (
                    <div className="text-center mt-16">
                      <IconCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p
                        className="text-sm font-600"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        Tu carrito está vacío.
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const p = storeProducts.find((x) => x.id === item.productId)!
                      return (
                        <div
                          key={item.productId}
                          className="flex gap-3 items-center"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                            style={{ background: "var(--color-muted)" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-700 truncate"
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {p.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--color-muted-foreground)" }}
                            >
                              {fmt(p.price)} × {item.qty}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => removeFromCart(p.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition hover:bg-[var(--color-secondary)]"
                              style={{
                                color: "var(--color-muted-foreground)",
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              −
                            </button>
                            <span
                              className="text-sm font-800 w-4 text-center"
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {item.qty}
                            </span>
                            <button
                              disabled={isOffline}
                              onClick={() => addToCart(p.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition disabled:cursor-not-allowed disabled:opacity-40"
                              style={{
                                background: "var(--color-primary)",
                                color: "#fff",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {cart.length > 0 && (
                  <div
                    className="px-5 py-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex justify-between text-sm mb-4">
                      <span style={{ color: "var(--color-muted-foreground)" }}>
                        Total estimado
                      </span>
                      <span
                        className="font-800 text-lg"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {fmt(totalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCartOpen(false)
                        setOrderPlaced(false)
                        setView("cart")
                      }}
                      className="w-full py-3 rounded-xl font-700 text-sm transition hover:opacity-90 active:scale-[0.98]"
                      style={{
                        background: "var(--color-primary)",
                        color: "#fff",
                      }}
                    >
                      Ver resumen y confirmar
                    </button>
                  </div>
                )}
              </aside>
            </>
          )}
        </>
      )}

      {/* ── CART SUMMARY PAGE ────────────────────────────────────────────────── */}
      {view === "cart" && (
        <CartSummary
          cart={cart}
          products={storeProducts}
          totalPrice={totalPrice}
          orderPlaced={orderPlaced}
          pendingOrder={pendingOrder}
          isOffline={isOffline}
          onBack={goStore}
          onPlaceOrder={() => {
            // AQUÍ ESTÁ LA LÓGICA QUE BUSCABAS
            const created = new Date()
            const deadline = new Date(created.getTime() + 30 * 60 * 1000)
            const createdAt = created.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
            const deadlineTime = deadline.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
            const folio = `#MV-${Math.floor(Math.random() * 90000) + 10000}`
            const newOrder = {
              id: folio,
              items: [...cart],
              total: totalPrice,
              phone: phone || undefined,
              createdAt,
              deadlineTime,
            }
            setOrders((rows) => [...rows, { Id_folio_Venta: folio, Id_Usuario: "USR-200", total_Pagar: totalPrice, estado: "Pendiente", horario_Recoleccion: deadlineTime, fecha_Hora: created.toISOString(), Telefono: phone }])
            setOrderDetails((rows) => [...rows, ...cart.map((item) => ({ Id_Folio_Venta: folio, Id_Producto: `PR-${String(item.productId).padStart(3, "0")}`, Cantidad: item.qty, Precio_Venta_Historico: storeProducts.find((product) => product.id === item.productId)?.price || 0 }))])
            setInventory((rows) => rows.map((stock) => {
              const numericId = Number(stock.Id_Producto.replace(/\D/g, ""))
              const item = cart.find((cartItem) => cartItem.productId === numericId)
              return item ? { ...stock, Stock: Math.max(0, Number((stock.Stock - item.qty).toFixed(3))) } : stock
            }))
            setPendingOrder(newOrder) // Guarda el recibo
            setCart([])               // Vacía el carrito
            setOrderPlaced(true)      // Muestra la pantalla final
          }}
          onContinueShopping={() => {
            setView("store")
          }}
          onClearReceipt={() => {
            setPendingOrder(null)
            setOrderPlaced(false)
            setView("store")
          }}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />
      )}

      {/* ── EMPLOYEE LOGIN ────────────────────────────────────────────────────── */}
      {view === "employee-login" && (
        <EmployeeLoginScreen onSuccess={() => { setUserRole("employee"); setView("employee-panel") }} onBack={() => setView("login")} />
      )}

      {/* ── EMPLOYEE PANEL ───────────────────────────────────────────────────── */}
      {view === "employee-panel" && (
        <EmployeePanel products={storeProducts} inventory={inventory} setInventory={setInventory} users={users} setUsers={setUsers} credits={credits} setCredits={setCredits} creditHistory={creditHistory} setCreditHistory={setCreditHistory} orders={orders} setOrders={setOrders} orderDetails={orderDetails} dailyCuts={dailyCuts} setDailyCuts={setDailyCuts} isOffline={isOffline} userRole={userRole} onBackAdmin={() => setView("admin")} onLogout={() => setView("login")} />
      )}

      {/* ── ADMIN DASHBOARD ──────────────────────────────────────────────────── */}
      {view === "admin" && (
        <AdminDashboard
          products={storeProducts}
          dailyCuts={dailyCuts}
          fiados={MOCK_FIADOS}
          egresos={MOCK_EGRESOS}
          inventory={inventory}
          setInventory={setInventory}
          seasons={seasons}
          setSeasons={setSeasons}
          users={users}
          setUsers={setUsers}
          credits={credits}
          setCredits={setCredits}
          creditHistory={creditHistory}
          setCreditHistory={setCreditHistory}
          orders={orders}
          setOrders={setOrders}
          orderDetails={orderDetails}
          onGoPOS={() => setView("employee-panel")}
          onLogout={() => setView("login")}
        />
      )}
      {showProfile && (() => {
        const profile = users.find((user) => user.Id_Usuario === "USR-200")!
        const credit = credits.find((row) => row.Id_Usuario === profile.Id_Usuario)
        return <AdminModal title="👤 Mi Perfil" onClose={() => setShowProfile(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["Nombre_Completo", "Nombre_Completo"],
              ["Telefono", "Telefono"],
              ["Direccion", "Direccion"],
              ["Contraseña", "Contraseña"],
              ["Codigo_Seguridad (PIN 4 dígitos)", "Codigo_Seguridad"],
            ] as const).map(([label, key]) => <FormField key={key} label={label}><input className={controlClass} style={controlStyle} maxLength={key === "Codigo_Seguridad" ? 4 : undefined} value={profile[key]} onChange={(event) => setUsers((rows) => rows.map((user) => user.Id_Usuario === profile.Id_Usuario ? { ...user, [key]: event.target.value } : user))} /></FormField>)}
          </div>
          <div className="mt-5 rounded-2xl p-4" style={{ background: "var(--color-secondary)" }}>
            <p className="mb-3 font-bold">Resumen crediticio</p>
            <div className="grid grid-cols-3 gap-3 text-sm"><p>Límite<br /><strong>{fmt(credit?.Limite_Credito || 0)}</strong></p><p>Saldo<br /><strong>{fmt(credit?.Saldo_Deudor || 0)}</strong></p><p>Estado<br /><strong>{credit?.Estado_Credito || "Sin crédito"}</strong></p></div>
            <p className="mt-3 text-xs">🔒 Solo la clienta (administradora) tiene permisos para modificar el límite de crédito.</p>
          </div>
        </AdminModal>
      })()}
      {bulkProductId !== null && (() => {
        const product = storeProducts.find((item) => item.id === bulkProductId)!
        const stock = inventory.find((item) => Number(item.Id_Producto.replace(/\D/g, "")) === bulkProductId)!
        const numeric = Number(bulkValue)
        const qty = bulkMode === "monto" ? numeric / product.price : numeric
        const amount = bulkMode === "monto" ? numeric : numeric * product.price
        return <AdminModal title={`${product.name} · Venta a granel`} onClose={() => setBulkProductId(null)}>
          <div className="mb-4 flex gap-2"><AdminButton secondary={bulkMode !== "cantidad"} onClick={() => setBulkMode("cantidad")}>Por cantidad / peso</AdminButton><AdminButton secondary={bulkMode !== "monto"} onClick={() => setBulkMode("monto")}>Por monto en pesos ($)</AdminButton></div>
          <FormField label={bulkMode === "cantidad" ? `Cantidad (${stock.Unidad_Medida})` : "Monto a cobrar ($)"}><input autoFocus type="number" min=".01" step=".01" className={controlClass} style={controlStyle} value={bulkValue} onChange={(event) => setBulkValue(event.target.value)} /></FormField>
          <div className="my-4 rounded-xl p-4 text-sm" style={{ background: "var(--color-secondary)" }}><p>Peso equivalente: <strong>{Number.isFinite(qty) ? qty.toFixed(3) : "0.000"} {stock.Unidad_Medida}</strong></p><p>Subtotal: <strong>{fmt(Number.isFinite(amount) ? amount : 0)}</strong></p></div>
          <AdminButton disabled={!numeric || qty > stock.Stock || isOffline} onClick={() => { setCart((rows) => [...rows.filter((item) => item.productId !== bulkProductId), { productId: bulkProductId, qty, amount, saleMode: bulkMode }]); setBulkProductId(null) }}>Agregar al carrito</AdminButton>
        </AdminModal>
      })()}
    </div>
  )
}

// ─── Reusable form helpers ────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-[10px] font-700 uppercase tracking-widest"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({
  type,
  inputMode,
  autoComplete,
  maxLength,
  pattern,
  placeholder,
  value,
  onChange,
}: {
  type: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  autoComplete?: string
  maxLength?: number
  pattern?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      maxLength={maxLength}
      pattern={pattern}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={{
        background: "var(--color-card)",
        border: "1.5px solid var(--color-border)",
        color: "var(--color-foreground)",
        fontFamily: "var(--font-sans)",
      }}
      onFocus={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-primary)")
      }
      onBlur={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-border)")
      }
    />
  )
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  qty,
  onAdd,
  onRemove,
  onOpen,
  disabled = false,
}: {
  product: Product
  qty: number
  onAdd: () => void
  onRemove: () => void
  onOpen: () => void
  disabled?: boolean
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
      onClick={onOpen}
    >
      <div
        className="relative"
        style={{ paddingBottom: "100%", background: "var(--color-muted)" }}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: product.inStock ? 1 : 0.45 }}
        />
        {product.badge && (
          <span
            className="absolute top-2 left-2 text-[10px] font-800 px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accent-foreground)",
            }}
          >
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-2 right-2 text-[10px] font-700 px-2 py-0.5 rounded-full uppercase bg-black/60 text-white">
            Agotado
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p
            className="text-[10px] font-700 uppercase tracking-widest"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {product.category}
          </p>
          <p
            className="text-sm font-700 leading-snug mt-0.5"
            style={{ color: "var(--color-foreground)" }}
          >
            {product.name}
          </p>
          <p
            className="text-xs mt-1 line-clamp-2"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span
            className="text-base font-800"
            style={{ color: "var(--color-primary)" }}
          >
            {fmt(product.price)}
          </span>
          {product.inStock ? (
            qty === 0 ? (
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  onAdd()
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-700 transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "var(--color-primary)", color: "#fff" }}
              >
                Agregar
              </button>
            ) : (
              <div
                className="flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  disabled={disabled}
                  onClick={onRemove}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition hover:bg-[var(--color-secondary)]"
                  style={{
                    color: "var(--color-muted-foreground)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  −
                </button>
                <span
                  className="text-sm font-800 w-4 text-center"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {qty}
                </span>
                <button
                  disabled={disabled}
                  onClick={onAdd}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                  style={{ background: "var(--color-primary)", color: "#fff" }}
                >
                  +
                </button>
              </div>
            )
          ) : (
            <span
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              No disponible
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ProductDetail ────────────────────────────────────────────────────────────

function ProductDetail({
  product,
  qty,
  onAdd,
  onRemove,
  onBack,
  disabled = false,
}: {
  product: Product
  qty: number
  onAdd: () => void
  onRemove: () => void
  onBack: () => void
  disabled?: boolean
}) {
  const [imgIdx, setImgIdx] = useState(0)
  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-700 mb-6 transition hover:opacity-70"
        style={{ color: "var(--color-primary)" }}
      >
        <IconChevronLeft /> Volver al catálogo
      </button>
      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div
            className="rounded-2xl overflow-hidden aspect-square"
            style={{ background: "var(--color-muted)" }}
          >
            <img
              src={product.images[imgIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className="w-16 h-16 rounded-xl overflow-hidden border-2 transition"
                  style={{
                    borderColor:
                      imgIdx === i ? "var(--color-primary)" : "transparent",
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-700 uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--color-secondary)",
                  color: "var(--color-secondary-foreground)",
                }}
              >
                {product.category}
              </span>
              <span
                className="text-xs font-700 uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--color-muted)",
                  color: "var(--color-muted-foreground)",
                }}
              >
                {product.season}
              </span>
              {product.badge && (
                <span
                  className="text-xs font-800 uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-accent-foreground)",
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>
            <h1
              className="text-3xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-foreground)",
              }}
            >
              {product.name}
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {product.description}
            </p>
          </div>

          <div className="flex items-end gap-3">
            <span
              className="text-4xl font-800"
              style={{ color: "var(--color-primary)" }}
            >
              {fmt(product.price)}
            </span>
            {product.inStock ? (
              <span
                className="text-xs font-700 px-2 py-1 rounded-lg"
                style={{ background: "#e6f7ee", color: "#1a7a45" }}
              >
                ✓ En stock ({product.stock} unid.)
              </span>
            ) : (
              <span
                className="text-xs font-700 px-2 py-1 rounded-lg"
                style={{ background: "#fdf0ea", color: "#c85c2a" }}
              >
                Agotado
              </span>
            )}
          </div>

          {product.inStock && (
            <div className="flex items-center gap-3">
              {qty === 0 ? (
                <button
                  disabled={disabled}
                  onClick={onAdd}
                  className="flex-1 py-3 rounded-xl font-700 text-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "var(--color-primary)", color: "#fff" }}
                >
                  Agregar al carrito
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    disabled={disabled}
                    onClick={onRemove}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition hover:bg-[var(--color-secondary)]"
                    style={{
                      color: "var(--color-muted-foreground)",
                      border: "1.5px solid var(--color-border)",
                    }}
                  >
                    −
                  </button>
                  <span
                    className="text-xl font-800 w-6 text-center"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {qty}
                  </span>
                  <button
                    disabled={disabled}
                    onClick={onAdd}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition"
                    style={{
                      background: "var(--color-primary)",
                      color: "#fff",
                    }}
                  >
                    +
                  </button>
                  <span
                    className="text-sm ml-2 font-600"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    en tu carrito
                  </span>
                </div>
              )}
            </div>
          )}

          <div
            className="rounded-2xl p-4 text-sm"
            style={{ background: "var(--color-secondary)" }}
          >
            <p
              className="font-700 mb-1"
              style={{ color: "var(--color-foreground)" }}
            >
              📍 Ven por tu pedido a la tienda
            </p>
            <p style={{ color: "var(--color-secondary-foreground)" }}>
              Realiza tu pedido en línea y recógelo en nuestra tienda física. No
              contamos con servicio a domicilio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CartSummary ──────────────────────────────────────────────────────────────

function CartSummary({
  cart,
  products,
  totalPrice,
  orderPlaced,
  pendingOrder,
  isOffline,
  onBack,
  onPlaceOrder,
  onContinueShopping,
  onClearReceipt,
  addToCart,
  removeFromCart,
}: {
  cart: CartItem[]
  products: Product[]
  totalPrice: number
  orderPlaced: boolean
  pendingOrder?: OrderReceipt | null
  isOffline: boolean
  onBack: () => void
  onPlaceOrder: () => void
  onContinueShopping: () => void
  onClearReceipt: () => void
  addToCart: (id: number) => void
  removeFromCart: (id: number) => void
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Mini header */}
      <header
        className="border-b"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-700"
            style={{ color: "var(--color-primary)" }}
          >
            <IconChevronLeft /> Seguir comprando
          </button>
          <span
            className="font-bold text-lg ml-2"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-foreground)",
            }}
          >
            Resumen del pedido
          </span>
        </div>
      </header>
      {isOffline && <div className="border-b border-red-300 bg-red-50 px-5 py-3 text-center text-sm font-bold text-red-800">⚠️ Servicio no disponible: La tienda en línea está temporalmente fuera de servicio por falla de conexión con el servidor. Intenta más tarde (RF-28)</div>}

      <div className="max-w-4xl mx-auto px-5 py-8">
        {!orderPlaced ? (
          <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Items */}
            <div className="flex flex-col gap-3">
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-foreground)",
                }}
              >
                Artículos ({cart.reduce((s, i) => s + i.qty, 0)})
              </h2>
              {cart.map((item) => {
                const p = products.find((x) => x.id === item.productId)!
                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-4 rounded-2xl border items-center"
                    style={{
                      background: "var(--color-card)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                      style={{ background: "var(--color-muted)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-700 text-sm"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {p.category} · {p.season}
                      </p>
                      <p
                        className="text-sm font-800 mt-1"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {fmt(p.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition hover:bg-[var(--color-secondary)]"
                        style={{
                          color: "var(--color-muted-foreground)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        −
                      </button>
                      <span
                        className="text-sm font-800 w-5 text-center"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {item.qty}
                      </span>
                      <button
                        disabled={isOffline}
                        onClick={() => addToCart(p.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          background: "var(--color-primary)",
                          color: "#fff",
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span
                      className="text-sm font-800 ml-2 shrink-0"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {fmt(p.price * item.qty)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl border p-5 sticky top-20"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <h3
                className="font-bold text-base mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-foreground)",
                }}
              >
                Total del pedido
              </h3>
              {cart.map((item) => {
                const p = products.find((x) => x.id === item.productId)!
                return (
                  <div
                    key={item.productId}
                    className="flex justify-between text-xs mb-2"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    <span>
                      {p.name} × {item.qty}
                    </span>
                    <span>{fmt(p.price * item.qty)}</span>
                  </div>
                )
              })}
              <div
                className="border-t mt-3 pt-3 flex justify-between font-800 text-base"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              >
                <span>Total</span>
                <span style={{ color: "var(--color-primary)" }}>
                  {fmt(totalPrice)}
                </span>
              </div>
              <button
                onClick={onPlaceOrder}
                disabled={isOffline}
                className="w-full mt-4 py-3 rounded-xl font-700 text-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "var(--color-primary)", color: "#fff" }}
              >
                Confirmar pedido
              </button>
              <p
                className="text-xs text-center mt-3"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Al confirmar, tu pedido queda registrado para recogida.
              </p>
            </div>
          </div>
        ) : (
          /* Order confirmed */
          <div className="max-w-md mx-auto text-center py-16">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#e6f7ee" }}
            >
              <IconCheck
                className="w-8 h-8"
                style={{ color: "#1a7a45" } as React.CSSProperties}
              />
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-foreground)",
              }}
            >
              ¡Pedido confirmado!
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Hemos registrado tu pedido por <strong>{fmt(pendingOrder?.total || 0)}</strong>.
              {pendingOrder?.phone && (
                <> También enviamos tu número de pedido al teléfono <strong>{pendingOrder.phone}</strong>.</>
              )}{" "}
              Te esperamos en tienda.
            </p>
            <div className="mb-6 rounded-2xl p-4 text-left text-sm" style={{ background: "var(--color-secondary)", color: "var(--color-secondary-foreground)" }}>
              <p>🕒 Hora de registro del pedido: <strong>{pendingOrder?.createdAt || "—"}</strong></p>
              <p className="mt-1">⏳ Hora límite de recolección: <strong>{pendingOrder?.deadlineTime || "—"}</strong> (30 minutos de tolerancia)</p>
              <p className="mt-2 text-xs">RF-07: Si no acudes dentro de los 30 minutos de tolerancia, el pedido se cancelará automáticamente y la mercancía regresará al inventario. Este horario también fue enviado en el aviso de WhatsApp (RF-10).</p>
            </div>

            {/* NO DELIVERY NOTICE — always visible */}
            <div
              className="rounded-2xl p-5 mb-6 text-left"
              style={{
                background: "#fff8ec",
                border: "2px solid var(--color-accent)",
              }}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--color-accent)" }}
                >
                  <IconWarning
                    className="w-5 h-5"
                    style={
                      {
                        color: "var(--color-accent-foreground)",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div>
                  <p
                    className="font-800 text-base mb-1"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    No contamos con servicio a domicilio
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#7a5c2a" }}
                  >
                    Para recibir tu pedido debes acudir personalmente a nuestra
                    tienda física. Presenta este número de pedido al llegar:
                    <br />
                    <strong
                      className="text-base"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {pendingOrder?.id}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 mb-8 text-sm"
              style={{ background: "var(--color-secondary)" }}
            >
              <p
                className="font-700 mb-0.5"
                style={{ color: "var(--color-foreground)" }}
              >
                📍 Dirección de la tienda
              </p>
              <p style={{ color: "var(--color-secondary-foreground)" }}>
                Av. Principal 142, Local 3 · Horario: Lun–Sáb 8 am – 8 pm
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onContinueShopping}
                className="px-8 py-3 rounded-xl font-700 text-sm transition hover:opacity-90 border-2"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                Volver a la tienda
              </button>
              <button
                onClick={onClearReceipt}
                className="px-8 py-3 rounded-xl font-700 text-sm transition hover:bg-gray-100"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Desechar recibo finalizado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  products,
  sales,
  dashTab,
  setDashTab,
  onGoStore,
  onLogout,
}: {
  products: Product[]
  sales: SaleRecord[]
  dashTab: "ventas" | "inventario" | "ganancias"
  setDashTab: (t: "ventas" | "inventario" | "ganancias") => void
  onGoStore: () => void
  onLogout: () => void
}) {
  const totalRevenue = sales.reduce((s, r) => s + r.total, 0)
  const totalUnitsSold = sales.reduce((s, r) => s + r.qty, 0)
  const totalOrders = sales.length
  const avgOrder = totalRevenue / totalOrders

  const salesByProduct = products
    .map((p) => {
      const rows = sales.filter((r) => r.productId === p.id)
      return {
        product: p,
        units: rows.reduce((s, r) => s + r.qty, 0),
        revenue: rows.reduce((s, r) => s + r.total, 0),
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  const COST_RATIO = 0.55
  const grossProfit = totalRevenue * (1 - COST_RATIO)
  const profitByProduct = salesByProduct.map((r) => ({
    ...r,
    profit: r.revenue * (1 - COST_RATIO),
  }))

  const maxBar = Math.max(...salesByProduct.map((r) => r.revenue), 1)
  const maxProfit = Math.max(...profitByProduct.map((r) => r.profit), 1)

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: "var(--color-primary)" }}
            >
              M
            </div>
            <span
              className="font-bold text-base"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-foreground)",
              }}
            >
              Panel de Propietario
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onGoStore}
              className="flex items-center gap-1.5 text-sm font-700 px-3 py-2 rounded-xl transition hover:bg-[var(--color-secondary)]"
              style={{ color: "var(--color-primary)" }}
            >
              <IconStore className="w-4 h-4" /> Ver tienda
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-xl transition hover:bg-[var(--color-secondary)]"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              <IconUser className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Ingresos totales",
              value: fmt(totalRevenue),
              sub: "Agosto–Sept 2026",
              icon: "💰",
            },
            {
              label: "Pedidos realizados",
              value: String(totalOrders),
              sub: "último período",
              icon: "📦",
            },
            {
              label: "Unidades vendidas",
              value: String(totalUnitsSold),
              sub: "unidades",
              icon: "🛒",
            },
            {
              label: "Ticket promedio",
              value: fmt(avgOrder),
              sub: "por pedido",
              icon: "📊",
            },
          ].map(({ label, value, sub, icon }) => (
            <div
              key={label}
              className="rounded-2xl p-4 border"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <p className="text-xl mb-1">{icon}</p>
              <p
                className="text-2xl font-800"
                style={{ color: "var(--color-foreground)" }}
              >
                {value}
              </p>
              <p
                className="text-xs font-700 mt-0.5"
                style={{ color: "var(--color-foreground)" }}
              >
                {label}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Profit highlight */}
        <div
          className="rounded-2xl p-5 mb-8 flex items-center gap-5 border"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, #e87a3f 100%)",
            borderColor: "transparent",
          }}
        >
          <div className="flex-1">
            <p className="text-white/70 text-xs font-700 uppercase tracking-widest mb-1">
              Ganancia bruta estimada
            </p>
            <p className="text-4xl font-800 text-white">{fmt(grossProfit)}</p>
            <p className="text-white/70 text-xs mt-1">
              Margen estimado del 45% sobre {fmt(totalRevenue)} en ventas
            </p>
          </div>
          <IconChart className="w-12 h-12 text-white/30" />
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
          style={{ background: "var(--color-secondary)" }}
        >
          {(["ventas", "inventario", "ganancias"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDashTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-700 transition capitalize"
              style={
                dashTab === t
                  ? {
                    background: "var(--color-card)",
                    color: "var(--color-primary)",
                    boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                  }
                  : { color: "var(--color-muted-foreground)" }
              }
            >
              {t === "ventas"
                ? "Reporte de Ventas"
                : t === "inventario"
                  ? "Inventario"
                  : "Ganancias"}
            </button>
          ))}
        </div>

        {/* ── Sales tab ── */}
        {dashTab === "ventas" && (
          <div className="flex flex-col gap-6">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Ventas por producto
                </h3>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {salesByProduct
                  .filter((r) => r.revenue > 0)
                  .map((row) => (
                    <div
                      key={row.product.id}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={row.product.images[0]}
                        alt={row.product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-700 truncate"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {row.product.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {row.units} unidades
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-48">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--color-muted)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(row.revenue / maxBar) * 100}%`,
                              background: "var(--color-primary)",
                            }}
                          />
                        </div>
                        <span
                          className="text-sm font-800 shrink-0"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {fmt(row.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent transactions */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Transacciones recientes
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1px solid var(--color-border)`,
                        background: "var(--color-secondary)",
                      }}
                    >
                      {["Fecha", "Producto", "Cant.", "Total"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-700 uppercase tracking-widest"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...sales].reverse().map((s, i) => {
                      const p = products.find((x) => x.id === s.productId)
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom: `1px solid var(--color-border)`,
                          }}
                        >
                          <td
                            className="px-5 py-3"
                            style={{ color: "var(--color-muted-foreground)" }}
                          >
                            {s.date}
                          </td>
                          <td
                            className="px-5 py-3 font-600"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            {p?.name ?? "—"}
                          </td>
                          <td
                            className="px-5 py-3"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            {s.qty}
                          </td>
                          <td
                            className="px-5 py-3 font-800"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {fmt(s.total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Inventory tab ── */}
        {dashTab === "inventario" && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h3
                className="font-bold"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-foreground)",
                }}
              >
                Estado del inventario
              </h3>
              <span
                className="text-xs font-700 px-2 py-1 rounded-lg"
                style={{
                  background: "var(--color-secondary)",
                  color: "var(--color-secondary-foreground)",
                }}
              >
                {products.filter((p) => !p.inStock).length} agotados
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: `1px solid var(--color-border)`,
                      background: "var(--color-secondary)",
                    }}
                  >
                    {[
                      "Producto",
                      "Categoría",
                      "Temporada",
                      "Stock",
                      "Vendidos",
                      "Estado",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-700 uppercase tracking-widest"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: `1px solid var(--color-border)` }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <span
                            className="font-700"
                            style={{ color: "var(--color-foreground)" }}
                          >
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {p.category}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {p.season}
                      </td>
                      <td
                        className="px-5 py-3 font-800"
                        style={{
                          color:
                            p.stock === 0
                              ? "#c85c2a"
                              : p.stock < 10
                                ? "#d4930a"
                                : "var(--color-foreground)",
                        }}
                      >
                        {p.stock}
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {p.unitsSold}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="text-xs font-700 px-2 py-0.5 rounded-full"
                          style={
                            p.inStock
                              ? { background: "#e6f7ee", color: "#1a7a45" }
                              : { background: "#fdf0ea", color: "#c85c2a" }
                          }
                        >
                          {p.inStock ? "Disponible" : "Agotado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Profits tab ── */}
        {dashTab === "ganancias" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Ingresos brutos",
                  value: fmt(totalRevenue),
                  color: "var(--color-primary)",
                },
                {
                  label: "Costo estimado (55%)",
                  value: fmt(totalRevenue * COST_RATIO),
                  color: "var(--color-muted-foreground)",
                },
                {
                  label: "Ganancia neta estimada",
                  value: fmt(grossProfit),
                  color: "#1a7a45",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl border p-5"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <p
                    className="text-xs font-700 uppercase tracking-widest mb-2"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {label}
                  </p>
                  <p className="text-3xl font-800" style={{ color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Ganancia por producto
                </h3>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {profitByProduct
                  .filter((r) => r.profit > 0)
                  .map((row) => (
                    <div
                      key={row.product.id}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={row.product.images[0]}
                        alt={row.product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-700 truncate"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {row.product.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          Ventas: {fmt(row.revenue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-48">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--color-muted)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(row.profit / maxProfit) * 100}%`,
                              background: "#1a7a45",
                            }}
                          />
                        </div>
                        <span
                          className="text-sm font-800 shrink-0"
                          style={{ color: "#1a7a45" }}
                        >
                          {fmt(row.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PillBtn ──────────────────────────────────────────────────────────────────

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-3 py-1 rounded-lg text-xs font-600 transition"
      style={active ? { background: "var(--color-accent)", color: "var(--color-accent-foreground)" } : { background: "var(--color-secondary)", color: "var(--color-secondary-foreground)" }}>
      {children}
    </button>
  )
}

// ─── EmployeeLoginScreen ──────────────────────────────────────────────────────

function EmployeeLoginScreen({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [err, setErr] = useState("")
  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !pass) { setErr("Ingresa usuario y contraseña."); return }
    if (pass.length < 4) { setErr("Contraseña incorrecta."); return }
    onSuccess()
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#1a1714" }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3" style={{ background: "var(--color-primary)" }}>M</div>
          <p className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-serif)" }}>Tienda González</p>
          <p className="text-white/50 text-sm mt-1">Acceso para personal</p>
        </div>
        <div className="rounded-3xl p-6" style={{ background: "var(--color-card)" }}>
          <h2 className="font-bold text-lg mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}>Registrar entrada</h2>
          <p className="text-xs mb-5" style={{ color: "var(--color-muted-foreground)" }}>Ingresa tus credenciales para iniciar turno.</p>
          <form onSubmit={handle} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-700 uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>Usuario</label>
              <input type="text" placeholder="tu.nombre" value={user} onChange={(e) => setUser(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--color-secondary)", border: "1.5px solid var(--color-border)", color: "var(--color-foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-700 uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>Contraseña</label>
              <input type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--color-secondary)", border: "1.5px solid var(--color-border)", color: "var(--color-foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")} />
            </div>
            {err && <p className="text-xs px-3 py-2 rounded-xl" style={{ color: "#c85c2a", background: "#fdf0ea" }}>{err}</p>}
            <button type="submit" className="py-3 rounded-xl font-700 text-sm mt-1 transition hover:opacity-90" style={{ background: "var(--color-primary)", color: "#fff" }}>
              Iniciar turno
            </button>
          </form>
        </div>
        <button onClick={onBack} className="w-full text-center mt-4 text-sm font-600 transition hover:opacity-80" style={{ color: "var(--color-muted-foreground)" }}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

// ─── EmployeePanel (POS) ──────────────────────────────────────────────────────

function EmployeePanel({ products, inventory, setInventory, users, setUsers, credits, setCredits, creditHistory, setCreditHistory, orders, setOrders, orderDetails, dailyCuts, setDailyCuts, isOffline, userRole, onBackAdmin, onLogout }: {
  products: Product[]; inventory: InventoryItem[]; setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  users: CreditUser[]; setUsers: React.Dispatch<React.SetStateAction<CreditUser[]>>; credits: CreditAccount[]; setCredits: React.Dispatch<React.SetStateAction<CreditAccount[]>>;
  creditHistory: CreditMovement[]; setCreditHistory: React.Dispatch<React.SetStateAction<CreditMovement[]>>; orders: AdminSale[]; setOrders: React.Dispatch<React.SetStateAction<AdminSale[]>>;
  orderDetails: SaleDetail3NF[]; dailyCuts: DailyCut[]; setDailyCuts: React.Dispatch<React.SetStateAction<DailyCut[]>>; isOffline: boolean; userRole: UserRole; onBackAdmin: () => void; onLogout: () => void
}) {
  const [tab, setTab] = useState<"venta" | "fiados" | "pedidos" | "historial">("venta")
  const [posItems, setPosItems] = useState<CartItem[]>([])
  const [history, setHistory] = useState<{ id: string; time: string; items: number; total: number }[]>([])
  const [search, setSearch] = useState("")
  const [paid, setPaid] = useState("")
  const [paymentType, setPaymentType] = useState<"efectivo" | "fiado">("efectivo")
  const [creditId, setCreditId] = useState(credits[0]?.Id_Fiado || "")
  const [thirdParty, setThirdParty] = useState(false)
  const [pin, setPin] = useState("")
  const [message, setMessage] = useState("")
  const [bulk, setBulk] = useState<InventoryItem | null>(null)
  const [bulkMode, setBulkMode] = useState<"cantidad" | "monto">("cantidad")
  const [bulkValue, setBulkValue] = useState("")
  const [showCut, setShowCut] = useState(false)
  const [physicalCash, setPhysicalCash] = useState("")
  const total = posItems.reduce((sum, item) => { const product = products.find((p) => p.id === item.productId); return sum + (item.amount ?? (product?.price || 0) * item.qty) }, 0)
  const totalHistory = history.reduce((sum, row) => sum + row.total, 0)
  const expectedCash = 1120 + totalHistory
  const difference = Number(physicalCash || 0) - expectedCash
  const addPiece = (id: number) => setPosItems((rows) => { const current = rows.find((item) => item.productId === id); return current ? rows.map((item) => item.productId === id ? { ...item, qty: item.qty + 1 } : item) : [...rows, { productId: id, qty: 1 }] })
  const chooseProduct = (product: Product) => { const stock = inventory.find((item) => Number(item.Id_Producto.replace(/\D/g, "")) === product.id); if (stock?.Modalidad_Venta === "Granel") { setBulk(stock); setBulkValue("") } else addPiece(product.id) }
  const addBulk = () => { if (!bulk) return; const productId = Number(bulk.Id_Producto.replace(/\D/g, "")); const value = Number(bulkValue); const qty = bulkMode === "monto" ? value / bulk.Precio_Venta : value; const amount = bulkMode === "monto" ? value : qty * bulk.Precio_Venta; if (qty <= 0 || qty > bulk.Stock) return; setPosItems((rows) => [...rows.filter((item) => item.productId !== productId), { productId, qty, amount, saleMode: bulkMode }]); setBulk(null) }
  const closeSale = () => {
    if (!posItems.length) return
    if (paymentType === "efectivo" && Number(paid) < total) { setMessage("El efectivo recibido es insuficiente."); return }
    if (paymentType === "fiado") {
      const credit = credits.find((row) => row.Id_Fiado === creditId); const user = users.find((row) => row.Id_Usuario === credit?.Id_Usuario)
      if (!credit || credit.Estado_Credito === "Suspendido") { setMessage("Cuenta de fiado no disponible."); return }
      if (thirdParty && pin !== user?.Codigo_Seguridad) { setMessage("Tercero no autorizado (RF-29)."); return }
      if (credit.Saldo_Deudor + total > credit.Limite_Credito) { setCredits((rows) => rows.map((row) => row.Id_Fiado === credit.Id_Fiado ? { ...row, Estado_Credito: "Bloqueado por límite" } : row)); setMessage("¡Límite de crédito excedido! Debe abonar antes de fiar más."); return }
      setCredits((rows) => rows.map((row) => row.Id_Fiado === credit.Id_Fiado ? { ...row, Saldo_Deudor: row.Saldo_Deudor + total } : row))
      setCreditHistory((rows) => [...rows, { Id_Movimiento: `MOV-${rows.length + 1}`, Id_Fiado: credit.Id_Fiado, Fecha: new Date().toISOString().slice(0, 10), Tipo: "Cargo Fiado", Monto: total, Autorizado_Por: thirdParty ? "Tercero con PIN" : "Titular" }])
    }
    setInventory((rows) => rows.map((stock) => { const id = Number(stock.Id_Producto.replace(/\D/g, "")); const item = posItems.find((cartItem) => cartItem.productId === id); return item ? { ...stock, Stock: Math.max(0, Number((stock.Stock - item.qty).toFixed(3))) } : stock }))
    setHistory((rows) => [...rows, { id: `V-${String(rows.length + 50).padStart(4, "0")}`, time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }), items: posItems.length, total }])
    setPosItems([]); setPaid(""); setMessage("Venta registrada correctamente.")
  }
  const updateOrder = (order: AdminSale, status: "Completado" | "Cancelado") => { setOrders((rows) => rows.map((row) => row.Id_folio_Venta === order.Id_folio_Venta ? { ...row, estado: status } : row)); if (status === "Cancelado") setInventory((rows) => rows.map((stock) => { const qty = orderDetails.filter((detail) => detail.Id_Folio_Venta === order.Id_folio_Venta && detail.Id_Producto === stock.Id_Producto).reduce((sum, detail) => sum + detail.Cantidad, 0); return qty ? { ...stock, Stock: stock.Stock + qty } : stock })) }
  const saveCut = () => { const actual = Number(physicalCash); setDailyCuts((rows) => [...rows, { date: new Date().toISOString().slice(0, 10), opening: 1120, sales: totalHistory, expenses: 0, closing: actual, expected: expectedCash, actual, difference, employee: userRole === "admin" ? "Maricela Hernández Ríos" : "Socia en turno" }]); setShowCut(false); setPhysicalCash("") }
  const tabs = [["venta", "Nueva venta (Caja)"], ["fiados", "Fiados (Créditos)"], ["pedidos", "Pedidos Web (30 min)"], ["historial", "Historial del día"]] as const
  return <div className="min-h-screen bg-[#1a1714] text-white"><header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3"><div><p className="font-bold">Panel de Empleado / POS</p><p className="text-xs text-white/50">{new Date().toLocaleString("es-MX")}</p></div>{userRole === "admin" && <button onClick={onBackAdmin} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold">⬅️ Volver al Panel de Administradora</button>}<div className="ml-auto flex gap-2"><button onClick={() => setShowCut(true)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-accent">Corte de caja</button><button onClick={onLogout} className="rounded-xl bg-white/10 px-3 py-2 text-xs">Salir</button></div></header>
    {isOffline && <div className="bg-amber-500/20 px-5 py-3 text-center text-sm font-bold text-amber-200">📡 Modo Local Sin Red: El punto de venta sigue operando localmente. Las ventas se sincronizarán al restablecer la conexión</div>}
    <div className="p-4"><div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">{tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-3 py-3 text-xs font-bold ${tab === key ? "bg-primary" : "bg-white/10 text-white/60"}`}>{label}</button>)}</div>{message && <p className="mb-3 rounded-xl bg-white/10 p-3 text-sm">{message}</p>}
      {tab === "venta" && <div className="grid gap-4 lg:grid-cols-[1fr_380px]"><section><input className="mb-3 w-full rounded-xl bg-white/10 px-4 py-3 outline-none" placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} /><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{products.filter((p) => p.inStock && p.name.toLowerCase().includes(search.toLowerCase())).map((product) => <button key={product.id} onClick={() => chooseProduct(product)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left"><img src={product.images[0]} className="mb-2 aspect-square w-full rounded-xl object-cover" /><p className="text-xs font-bold">{product.name}</p><p className="text-sm font-extrabold text-accent">{fmt(product.price)} {inventory.find((item) => Number(item.Id_Producto.replace(/\D/g, "")) === product.id)?.Modalidad_Venta === "Granel" ? "/ medida" : "/ pz"}</p></button>)}</div></section><aside className="rounded-2xl bg-white/5 p-4"><h2 className="mb-3 font-bold">Ticket actual</h2>{posItems.map((item) => { const p = products.find((product) => product.id === item.productId)!; return <div key={item.productId} className="flex items-center justify-between border-b border-white/10 py-3 text-sm"><div><p className="font-bold">{p.name}</p><p className="text-white/50">{item.qty.toFixed(item.qty % 1 ? 3 : 0)} · {item.saleMode === "monto" ? "por monto" : "por cantidad"}</p></div><strong>{fmt(item.amount ?? p.price * item.qty)}</strong></div> })}<div className="my-4 flex justify-between text-xl font-extrabold"><span>Total</span><span className="text-accent">{fmt(total)}</span></div><div className="mb-3 flex gap-2"><button onClick={() => setPaymentType("efectivo")} className={`flex-1 rounded-xl p-2 text-xs font-bold ${paymentType === "efectivo" ? "bg-primary" : "bg-white/10"}`}>Efectivo</button><button onClick={() => setPaymentType("fiado")} className={`flex-1 rounded-xl p-2 text-xs font-bold ${paymentType === "fiado" ? "bg-primary" : "bg-white/10"}`}>Venta Fiada</button></div>{paymentType === "efectivo" ? <input type="number" className="mb-3 w-full rounded-xl bg-white/10 p-3" placeholder="Efectivo recibido" value={paid} onChange={(e) => setPaid(e.target.value)} /> : <div className="mb-3 grid gap-2"><select className="rounded-xl bg-[#2e2a27] p-3" value={creditId} onChange={(e) => setCreditId(e.target.value)}>{credits.map((credit) => <option key={credit.Id_Fiado} value={credit.Id_Fiado}>{users.find((user) => user.Id_Usuario === credit.Id_Usuario)?.Nombre_Completo} · {fmt(credit.Saldo_Deudor)}</option>)}</select><label className="text-xs"><input type="checkbox" checked={thirdParty} onChange={(e) => setThirdParty(e.target.checked)} /> Compra un tercero</label>{thirdParty && <input className="rounded-xl bg-white/10 p-3" maxLength={4} placeholder="PIN del titular" value={pin} onChange={(e) => setPin(e.target.value)} />}</div>}<button onClick={closeSale} disabled={!posItems.length} className="w-full rounded-xl bg-primary p-3 font-bold disabled:opacity-40">Cobrar {fmt(total)}</button></aside></div>}
      {tab === "fiados" && <div className="rounded-2xl bg-background p-4 text-foreground"><FiadosModule intent={null} clearIntent={() => undefined} users={users} setUsers={setUsers} credits={credits} setCredits={setCredits} history={creditHistory} setHistory={setCreditHistory} canDelete={false} /></div>}
      {tab === "pedidos" && <div className="grid gap-3">{orders.filter((order) => order.estado === "Pendiente").map((order) => <article key={order.Id_folio_Venta} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold text-accent">{order.Id_folio_Venta}</p><p className="text-sm">Teléfono: {order.Telefono || "Sin capturar"}</p><p className="text-xs text-white/50">Creado: {order.fecha_Hora} · Límite: {order.horario_Recoleccion}</p></div><strong>{fmt(order.total_Pagar)}</strong></div><div className="mt-3 flex gap-2"><button onClick={() => updateOrder(order, "Completado")} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold">Cobrar y entregar</button><button onClick={() => updateOrder(order, "Cancelado")} className="rounded-xl bg-red-900 px-3 py-2 text-xs font-bold">Cancelar y liberar stock</button></div></article>)}{!orders.some((order) => order.estado === "Pendiente") && <p className="py-12 text-center text-white/50">No hay pedidos pendientes.</p>}</div>}
      {tab === "historial" && <div className="grid gap-2">{history.map((row) => <div key={row.id} className="flex justify-between rounded-xl bg-white/5 p-4"><span><strong>{row.id}</strong> · {row.time} · {row.items} partidas</span><strong>{fmt(row.total)}</strong></div>)}{!history.length && <p className="py-12 text-center text-white/50">El historial del día es de solo lectura.</p>}</div>}
    </div>
    {bulk && <AdminModal title={`${bulk.Nombre_Producto} · Granel`} onClose={() => setBulk(null)}><div className="mb-3 flex gap-2"><AdminButton secondary={bulkMode !== "cantidad"} onClick={() => setBulkMode("cantidad")}>Por cantidad / peso</AdminButton><AdminButton secondary={bulkMode !== "monto"} onClick={() => setBulkMode("monto")}>Por monto ($)</AdminButton></div><FormField label={bulkMode === "cantidad" ? `Cantidad (${bulk.Unidad_Medida})` : "Monto en pesos"}><input type="number" className={controlClass} style={controlStyle} value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} /></FormField><p className="my-3 text-sm">Equivalencia: <strong>{(bulkMode === "monto" ? Number(bulkValue) / bulk.Precio_Venta : Number(bulkValue || 0)).toFixed(3)} {bulk.Unidad_Medida}</strong></p><AdminButton onClick={addBulk}>Agregar al ticket</AdminButton></AdminModal>}
    {showCut && <AdminModal title="Corte de caja (RF-08)" onClose={() => setShowCut(false)}><div className="space-y-2 text-sm"><p>Fondo inicial: <strong>{fmt(1120)}</strong></p><p>Ventas del turno: <strong>{fmt(totalHistory)}</strong></p><p>Egresos: <strong>{fmt(0)}</strong></p><p className="text-lg">Efectivo esperado: <strong>{fmt(expectedCash)}</strong></p></div><div className="my-4"><FormField label="Efectivo físico contado en caja"><input autoFocus type="number" className={controlClass} style={controlStyle} value={physicalCash} onChange={(e) => setPhysicalCash(e.target.value)} /></FormField></div>{physicalCash && <p className={`mb-4 rounded-xl p-3 font-bold ${difference === 0 ? "bg-green-50 text-green-700" : difference < 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{difference === 0 ? `✓ Cuadre exacto (${fmt(0)})` : difference < 0 ? `⚠️ Faltante de caja (-${fmt(Math.abs(difference))})` : `➕ Sobrante de caja (+${fmt(difference)})`}</p>}<AdminButton disabled={!physicalCash} onClick={saveCut}>Confirmar corte</AdminButton></AdminModal>}
  </div>
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

type InventoryFilter = "todos" | "critico" | "agotados" | "granel" | "inhabilitados"

interface InventoryItem {
  Id_Producto: string
  Nombre_Producto: string
  Codigo_Barras: string
  Costo_Adquisicion: number
  Precio_Venta: number
  Descripcion: string
  Habilitado: boolean
  Categoria: string
  Stock: number
  Modalidad_Venta: "Pieza" | "Granel"
  Unidad_Medida: "pz" | "kg" | "lt" | "g"
  Imagen_Url: string
  Temporada: string
}

interface CreditUser {
  Id_Usuario: string
  Nombre_Completo: string
  Telefono: string
  Direccion: string
  Contraseña: string
  Rol: "Cliente" | "Administrador" | "Socia"
  Codigo_Seguridad: string
  Estado: "Activo" | "Inactivo"
}

interface CreditAccount {
  Id_Fiado: string
  Id_Usuario: string
  Limite_Credito: number
  Saldo_Deudor: number
  Fecha_Limite_Pago: string
  Estado_Credito: "Activo" | "Bloqueado por límite" | "Suspendido"
}

interface CreditMovement {
  Id_Movimiento: string
  Id_Fiado: string
  Fecha: string
  Tipo: "Cargo Fiado" | "Abono Parcial" | "Liquidación Total"
  Monto: number
  Autorizado_Por: string
}

interface AdminSale {
  Id_folio_Venta: string
  Id_Usuario: string
  total_Pagar: number
  estado: "Pendiente" | "Completado" | "Cancelado"
  horario_Recoleccion: string
  fecha_Hora: string
  Telefono?: string
}

interface SaleDetail3NF {
  Id_Folio_Venta: string
  Id_Producto: string
  Cantidad: number
  Precio_Venta_Historico: number
}

interface Loss3NF {
  Id_Perdidas: string
  Id_Producto: string
  Tipo_Perdida: string
  Descripcion: string
  Monto: number
  Fecha: string
}

interface SeasonAccount {
  Id_Temporada: string
  Nombre_Temporada: string
  Costo_Insumos: number
  Ventas_Temporada: number
  Ganancia_Neta: number
}

type AdminIntent =
  | "inventory-focus"
  | "inventory-new"
  | "inventory-critical"
  | "fiado-new"
  | "fiado-charge"
  | "fiado-payment"
  | null

function AdminButton({
  children,
  secondary,
  danger,
  small,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean
  danger?: boolean
  small?: boolean
}) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${small ? "min-h-9 px-3 py-1.5 text-xs" : "min-h-11 px-4 py-2 text-sm"
        }`}
      style={
        danger
          ? { background: "#fde8e8", color: "#991b1b" }
          : secondary
            ? {
              background: "var(--color-secondary)",
              color: "var(--color-secondary-foreground)",
            }
            : { background: "var(--color-primary)", color: "#ffffff" }
      }
    >
      {children}
    </button>
  )
}

function AdminModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div
        className="my-auto w-full max-w-2xl rounded-3xl border p-5 shadow-2xl sm:p-6"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-foreground)",
            }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:opacity-75"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Cerrar"
          >
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const controlClass =
  "min-h-11 w-full rounded-xl border px-3 py-2 text-sm outline-none transition"

const controlStyle: React.CSSProperties = {
  background: "var(--color-background)",
  borderColor: "var(--color-border)",
  color: "var(--color-foreground)",
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label
      className="flex min-w-0 flex-col gap-1.5 text-xs font-bold"
      style={{ color: "var(--color-secondary-foreground)" }}
    >
      <span>{label}</span>
      {children}
    </label>
  )
}

function InventoryOmnibox({
  inventory,
  setInventory,
  details,
  losses,
  intent,
  clearIntent,
  seasons,
  setSeasons,
  updateProductInFirestore,
  saveNewProductInFirestore,
}: {
  inventory: InventoryItem[]
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
  details: SaleDetail3NF[]
  losses: Loss3NF[]
  intent: AdminIntent
  clearIntent: () => void
  seasons: SeasonAccount[]
  setSeasons: React.Dispatch<React.SetStateAction<SeasonAccount[]>>
  updateProductInFirestore: (id: string, updatedFields: Partial<InventoryItem>) => Promise<void>;
  saveNewProductInFirestore: (newProduct: InventoryItem) => Promise<void>;
}) {
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<InventoryFilter>("todos")
  const [draft, setDraft] = useState<InventoryItem | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [manualPrice, setManualPrice] = useState(false)
  const [message, setMessage] = useState("")
  const [newSeasonName, setNewSeasonName] = useState("")

  const createBlankItem = (): InventoryItem => ({
    Id_Producto: `PR-${String(inventory.length + 1).padStart(3, "0")}`,
    Nombre_Producto: "",
    Codigo_Barras: "",
    Costo_Adquisicion: 0,
    Precio_Venta: 0,
    Descripcion: "",
    Habilitado: true,
    Categoria: "Abarrotes",
    Stock: 0,
    Modalidad_Venta: "Pieza",
    Unidad_Medida: "pz",
    Imagen_Url: "",
    Temporada: "Todo el año",
  })

  useEffect(() => {
    if (!intent || !intent.startsWith("inventory")) return
    if (intent === "inventory-critical") {
      setFilter("critico")
    }
    if (intent === "inventory-new") {
      setDraft(createBlankItem())
      setEditing(null)
      setManualPrice(false)
    } else {
      setTimeout(() => searchRef.current?.focus(), 0)
    }
    clearIntent()
  }, [intent])

  const criticalCount = inventory.filter((item) => item.Stock <= 6).length
  const inventoryValue = inventory.reduce(
    (sum, item) => sum + item.Costo_Adquisicion * item.Stock,
    0,
  )

  const filtered = inventory.filter((item) => {
    const q = query.toLowerCase()
    const matches = [
      item.Nombre_Producto,
      item.Codigo_Barras,
      item.Id_Producto,
      item.Categoria,
    ].some((fieldVal) => fieldVal.toLowerCase().includes(q))
    if (!matches) return false
    if (filter === "critico") return item.Stock <= 6
    if (filter === "agotados") return item.Stock === 0
    if (filter === "granel") return item.Modalidad_Venta === "Granel"
    if (filter === "inhabilitados") return !item.Habilitado
    return true
  })

  const updateCost = (cost: number) => {
    setDraft((current) =>
      current
        ? {
          ...current,
          Costo_Adquisicion: cost,
          Precio_Venta: manualPrice
            ? current.Precio_Venta
            : Number((cost * 1.3).toFixed(2)),
        }
        : current,
    )
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft) return
    if (!draft.Nombre_Producto || !draft.Codigo_Barras || !draft.Id_Producto) {
      setMessage("Completa los campos obligatorios del producto.")
      return
    }

    if (editing) {
      // Si estamos editando, actualizamos en Firestore
      await updateProductInFirestore(draft.Id_Producto, draft)
    } else {
      // Si estamos creando uno nuevo, lo guardamos en Firestore
      await saveNewProductInFirestore(draft)
    }

    setDraft(null)
    setMessage("Producto guardado correctamente en Firestore.")
  }

  const remove = (item: InventoryItem) => {
    if (
      details.some((detail) => detail.Id_Producto === item.Id_Producto) ||
      losses.some((loss) => loss.Id_Producto === item.Id_Producto)
    ) {
      setMessage(
        `No se puede eliminar ${item.Id_Producto}: tiene referencias en Detalle_Venta o Perdidas (3NF). Desactiva "Habilitado" para aplicar la baja lógica (RF-21).`,
      )
      return
    }
    if (window.confirm(`¿Eliminar físicamente ${item.Nombre_Producto}?`)) {
      setInventory((current) =>
        current.filter((row) => row.Id_Producto !== item.Id_Producto),
      )
      setMessage(`Producto ${item.Id_Producto} eliminado del catálogo.`)
    }
  }

  const filters: { key: InventoryFilter; label: string }[] = [
    { key: "todos", label: "Todos (1,245)" },
    { key: "critico", label: `Stock Crítico ≤ 6 (${criticalCount})` },
    { key: "agotados", label: "Agotados" },
    { key: "granel", label: "A Granel / Pieza" },
    { key: "inhabilitados", label: "Inhabilitados" },
  ]

  const kpiCards = [
    { kpiVal: "1,245", label: "SKUs Registrados", sub: "Catálogo Activo" },
    {
      kpiVal: fmt(inventoryValue),
      label: "Valor del Inventario",
      sub: "Costo × existencias",
    },
    { kpiVal: "+30%", label: "Margen Automático", sub: "RF-19 y RF-20" },
    {
      kpiVal: String(criticalCount),
      label: "Alertas críticas",
      sub: "≤ 6 unidades (RF-18)",
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-foreground)",
          }}
        >
          Gestión de Inventario Omnibox
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Tabla Producto · Simulación de 1,245 SKUs con ajustes en tiempo real
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map(({ kpiVal, label, sub }) => (
          <div
            key={label}
            className="rounded-2xl border p-4"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="text-2xl font-extrabold"
              style={{ color: "var(--color-foreground)" }}
            >
              {kpiVal}
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              {label}
            </p>
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
              ▥
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en 1,245 SKUs por nombre, código EAN-13, PR-001 o categoría..."
              className={`${controlClass} pl-10`}
              style={controlStyle}
            />
          </div>
          <AdminButton
            onClick={() => {
              setDraft(createBlankItem())
              setEditing(null)
              setManualPrice(false)
            }}
          >
            <IconPlus className="h-4 w-4" /> Dar de alta producto (+30%)
          </AdminButton>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className="rounded-full px-3 py-2 text-xs font-bold transition"
              style={
                filter === item.key
                  ? { background: "var(--color-primary)", color: "#ffffff" }
                  : {
                    background: "var(--color-secondary)",
                    color: "var(--color-secondary-foreground)",
                  }
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filter === "critico" && (
        <div
          className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-primary)",
          }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
            RF-18 · {criticalCount} productos con 6 unidades o menos listos para notificar al celular de Maricela.
          </p>
          <AdminButton
            small
            onClick={() =>
              setMessage(
                `Alerta móvil enviada al celular de Maricela: ${criticalCount} productos requieren reabastecimiento urgente .`,
              )
            }
          >
            <IconBell className="h-4 w-4" /> Enviar alerta al celular
          </AdminButton>
        </div>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl p-3 text-sm font-bold"
          style={{
            background: "var(--color-secondary)",
            color: "var(--color-secondary-foreground)",
          }}
        >
          {message}
        </p>
      )}

      <div
        className="overflow-x-auto rounded-2xl border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <table className="w-full min-w-[1180px] text-left text-xs">
          <thead
            style={{
              background: "var(--color-secondary)",
              color: "var(--color-secondary-foreground)",
            }}
          >
            <tr>
              {[
                "Id_Producto",
                "Nombre_Producto",
                "Codigo_Barras",
                "Costo_Adquisicion",
                "Precio_Venta (+30%)",
                "Categoria",
                "Temporada",
                "Stock",
                "Modalidad / Unidad",
                "Habilitado",
                "Acciones",
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.Id_Producto}
                className="border-t"
                style={{
                  borderColor: "var(--color-border)",
                  background: item.Stock <= 6 ? "#fef2f2" : "transparent",
                }}
              >
                <td
                  className="px-3 py-3 font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {item.Id_Producto}
                </td>
                <td className="max-w-48 px-3 py-3">
                  <p
                    className="font-bold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {item.Nombre_Producto}
                  </p>
                  <p
                    className="truncate"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {item.Descripcion}
                  </p>
                </td>
                <td className="px-3 py-3 font-mono">{item.Codigo_Barras}</td>
                <td className="px-3 py-3">{fmt(item.Costo_Adquisicion)}</td>
                <td className="px-3 py-3 font-bold">{fmt(item.Precio_Venta)}</td>
                <td className="px-3 py-3">{item.Categoria}</td>
                <td className="px-3 py-3">{item.Temporada}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setInventory((rows) =>
                          rows.map((row) =>
                            row.Id_Producto === item.Id_Producto
                              ? {
                                ...row,
                                Stock: Math.max(
                                  0,
                                  Number(
                                    (
                                      row.Stock -
                                      (row.Modalidad_Venta === "Granel"
                                        ? 0.1
                                        : 1)
                                    ).toFixed(2),
                                  ),
                                ),
                              }
                              : row,
                          ),
                        )
                      }
                      className="h-8 w-8 rounded-lg border font-bold"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      −
                    </button>
                    <span
                      className={`min-w-12 text-center font-extrabold ${item.Stock <= 6 ? "text-red-700" : ""
                        }`}
                    >
                      {item.Stock}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setInventory((rows) =>
                          rows.map((row) =>
                            row.Id_Producto === item.Id_Producto
                              ? {
                                ...row,
                                Stock: Number(
                                  (
                                    row.Stock +
                                    (row.Modalidad_Venta === "Granel"
                                      ? 0.1
                                      : 1)
                                  ).toFixed(2),
                                ),
                              }
                              : row,
                          ),
                        )
                      }
                      className="h-8 w-8 rounded-lg border font-bold"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {item.Modalidad_Venta} · {item.Unidad_Medida}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.Habilitado}
                    onClick={() =>
                      setInventory((rows) =>
                        rows.map((row) =>
                          row.Id_Producto === item.Id_Producto
                            ? { ...row, Habilitado: !row.Habilitado }
                            : row,
                        ),
                      )
                    }
                    className="relative h-7 w-12 rounded-full transition"
                    style={{
                      background: item.Habilitado
                        ? "var(--color-primary)"
                        : "var(--color-muted)",
                    }}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.Habilitado ? "left-6" : "left-1"
                        }`}
                    />
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <AdminButton
                      small
                      secondary
                      onClick={() => {
                        setDraft({ ...item })
                        setEditing(item.Id_Producto)
                        setManualPrice(true)
                      }}
                    >
                      Modificar
                    </AdminButton>
                    <AdminButton small danger onClick={() => remove(item)}>
                      <IconTrash className="h-4 w-4" />
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p
            className="p-8 text-center text-sm"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            No hay coincidencias en el Omnibox.
          </p>
        )}
      </div>

      {draft && (
        <AdminModal
          title={editing ? `Modificar ${editing}` : "Agregar Producto"}
          onClose={() => setDraft(null)}
        >
          <form onSubmit={save}>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Id_Producto (PK)">
                <input
                  required
                  disabled={Boolean(editing)}
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Id_Producto}
                  onChange={(e) =>
                    setDraft({ ...draft, Id_Producto: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Nombre_Producto">
                <input
                  required
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Nombre_Producto}
                  onChange={(e) =>
                    setDraft({ ...draft, Nombre_Producto: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Codigo_Barras (EAN-13)">
                <input
                  required
                  maxLength={13}
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Codigo_Barras}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      Codigo_Barras: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </FormField>
              <FormField label="Costo_Adquisicion ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Costo_Adquisicion}
                  onChange={(e) => updateCost(Number(e.target.value))}
                />
                <span style={{ color: "var(--color-primary)" }}>
                  Sugerido +30%:{" "}
                  {fmt(Number((draft.Costo_Adquisicion * 1.3).toFixed(2)))}
                </span>
              </FormField>
              <FormField label="Precio_Venta (ajustable)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Precio_Venta}
                  onChange={(e) => {
                    setManualPrice(true)
                    setDraft({ ...draft, Precio_Venta: Number(e.target.value) })
                  }}
                />
              </FormField>
              <FormField label="Categoria">
                <select
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Categoria}
                  onChange={(e) =>
                    setDraft({ ...draft, Categoria: e.target.value })
                  }
                >
                  {[
                    "Abarrotes",
                    "Lácteos",
                    "Panadería",
                    "Bebidas",
                    "Frutas y Verduras",
                    "Manualidades",
                    "Perfumería",
                    "Comida",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Temporada">
                <select className={controlClass} style={controlStyle} value={draft.Temporada} onChange={(e) => setDraft({ ...draft, Temporada: e.target.value })}>
                  {seasons.map((season) => <option key={season.Id_Temporada} value={season.Nombre_Temporada}>{season.Nombre_Temporada}</option>)}
                </select>
              </FormField>
              <FormField label="Stock actual">
                <input
                  type="number"
                  min="0"
                  step={draft.Modalidad_Venta === "Granel" ? "0.01" : "1"}
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Stock}
                  onChange={(e) =>
                    setDraft({ ...draft, Stock: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField label="Modalidad_Venta">
                <select
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Modalidad_Venta}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      Modalidad_Venta:
                        e.target.value as InventoryItem["Modalidad_Venta"],
                    })
                  }
                >
                  <option value="Pieza">Pieza</option>
                  <option value="Granel">Granel</option>
                </select>
              </FormField>
              <FormField label="Unidad_Medida">
                <select
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Unidad_Medida}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      Unidad_Medida:
                        e.target.value as InventoryItem["Unidad_Medida"],
                    })
                  }
                >
                  {["pz", "kg", "lt", "g"].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Imagen_Url">
                <input
                  type="url"
                  className={controlClass}
                  style={controlStyle}
                  value={draft.Imagen_Url}
                  onChange={(e) =>
                    setDraft({ ...draft, Imagen_Url: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Descripcion">
                <textarea
                  className={controlClass}
                  style={controlStyle}
                  rows={3}
                  value={draft.Descripcion}
                  onChange={(e) =>
                    setDraft({ ...draft, Descripcion: e.target.value })
                  }
                />
              </FormField>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={draft.Habilitado}
                  onChange={(e) =>
                    setDraft({ ...draft, Habilitado: e.target.checked })
                  }
                />
                Habilitado en catálogo y punto de venta
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton secondary onClick={() => setDraft(null)}>
                Cancelar
              </AdminButton>
              <AdminButton type="submit">Guardar producto</AdminButton>
            </div>
          </form>
        </AdminModal>
      )}
      <form onSubmit={(event) => { event.preventDefault(); if (!newSeasonName.trim()) return; setSeasons((rows) => [...rows, { Id_Temporada: `TEMP-${String(rows.length + 1).padStart(3, "0")}`, Nombre_Temporada: newSeasonName.trim(), Costo_Insumos: 0, Ventas_Temporada: 0, Ganancia_Neta: 0 }]); setNewSeasonName(""); setMessage("Temporada creada y disponible en Inventario y Tienda.") }} className="flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-end" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <FormField label="Gestionar Temporadas (RF-23)"><input className={controlClass} style={controlStyle} placeholder="Nueva temporada, ej. Día de Reyes" value={newSeasonName} onChange={(event) => setNewSeasonName(event.target.value)} /></FormField>
        <AdminButton type="submit">Crear temporada</AdminButton>
      </form>
    </div>
  )
}

function FiadosModule({
  intent,
  clearIntent,
  users,
  setUsers,
  credits,
  setCredits,
  history,
  setHistory,
  canDelete = true,
}: {
  intent: AdminIntent
  clearIntent: () => void
  users: CreditUser[]
  setUsers: React.Dispatch<React.SetStateAction<CreditUser[]>>
  credits: CreditAccount[]
  setCredits: React.Dispatch<React.SetStateAction<CreditAccount[]>>
  history: CreditMovement[]
  setHistory: React.Dispatch<React.SetStateAction<CreditMovement[]>>
  canDelete?: boolean
}) {
  const [mode, setMode] = useState<
    "new" | "charge" | "payment" | "history" | null
  >(null)
  const [selected, setSelected] = useState<CreditAccount | null>(null)
  const [amount, setAmount] = useState("")
  const [thirdParty, setThirdParty] = useState(false)
  const [pin, setPin] = useState("")
  const [notice, setNotice] = useState("")
  const [newExisting, setNewExisting] = useState(
    users.find((u) => !credits.some((c) => c.Id_Usuario === u.Id_Usuario))
      ?.Id_Usuario || "new",
  )
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    address: "",
    pin: "",
  })
  const [limit, setLimit] = useState("500")
  const [deadline, setDeadline] = useState("2026-10-15")

  useEffect(() => {
    if (!intent || !intent.startsWith("fiado")) return
    setMode(
      intent === "fiado-new"
        ? "new"
        : intent === "fiado-charge"
          ? "charge"
          : "payment",
    )
    setSelected(credits[0] || null)
    clearIntent()
  }, [intent])

  const userFor = (credit: CreditAccount): CreditUser =>
    users.find((user) => user.Id_Usuario === credit.Id_Usuario) || {
      Id_Usuario: credit.Id_Usuario,
      Nombre_Completo: "Consumidor",
      Telefono: "—",
      Direccion: "—",
      Contraseña: "••••••••",
      Rol: "Cliente",
      Codigo_Seguridad: "0000",
      Estado: "Activo",
    }

  const addHistory = (
    credit: CreditAccount,
    Tipo: CreditMovement["Tipo"],
    Monto: number,
    Autorizado_Por: string,
  ) =>
    setHistory((rows) => [
      ...rows,
      {
        Id_Movimiento: `MOV-${String(rows.length + 1).padStart(3, "0")}`,
        Id_Fiado: credit.Id_Fiado,
        Fecha: new Date().toISOString().slice(0, 10),
        Tipo,
        Monto,
        Autorizado_Por,
      },
    ])

  const addCredit = (event: React.FormEvent) => {
    event.preventDefault()
    let userId = newExisting
    if (newExisting === "new") {
      if (!newUser.name || !/^\d{4}$/.test(newUser.pin)) {
        setNotice("Captura el nombre del consumidor y un PIN de 4 dígitos.")
        return
      }
      userId = `USR-${101 + users.length}`
      setUsers((rows) => [
        ...rows,
        {
          Id_Usuario: userId,
          Nombre_Completo: newUser.name,
          Telefono: newUser.phone,
          Direccion: newUser.address,
          Contraseña: "••••••••",
          Rol: "Cliente",
          Codigo_Seguridad: newUser.pin,
          Estado: "Activo",
        },
      ])
    }
    setCredits((rows) => [
      ...rows,
      {
        Id_Fiado: `F-${String(rows.length + 1).padStart(3, "0")}`,
        Id_Usuario: userId,
        Limite_Credito: Number(limit),
        Saldo_Deudor: 0,
        Fecha_Limite_Pago: deadline,
        Estado_Credito: "Activo",
      },
    ])
    setMode(null)
    setNotice("Nuevo fiado registrado en las tablas Usuario y Fiado.")
  }

  const charge = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const val = Number(amount)
    const user = userFor(selected)
    if (thirdParty && pin !== user.Codigo_Seguridad) {
      setNotice(
        "Alerta RF-29: Tercero no autorizado. El código de seguridad no coincide con el del titular.",
      )
      return
    }
    if (selected.Estado_Credito === "Suspendido") {
      setNotice("Crédito suspendido: no se permiten nuevos cargos.")
      return
    }
    if (selected.Saldo_Deudor + val > selected.Limite_Credito) {
      setCredits((rows) =>
        rows.map((row) =>
          row.Id_Fiado === selected.Id_Fiado
            ? { ...row, Estado_Credito: "Bloqueado por límite" }
            : row,
        ),
      )
      setNotice(
        "¡Límite de crédito excedido! El cliente debe realizar un abono antes de fiar más. Se envió alerta a Maricela.",
      )
      setMode(null)
      return
    }
    if (val <= 0) return
    setCredits((rows) =>
      rows.map((row) =>
        row.Id_Fiado === selected.Id_Fiado
          ? { ...row, Saldo_Deudor: Number((row.Saldo_Deudor + val).toFixed(2)) }
          : row,
      ),
    )
    addHistory(
      selected,
      "Cargo Fiado",
      val,
      thirdParty ? `Tercero autorizado (PIN ${user.Codigo_Seguridad})` : user.Nombre_Completo,
    )
    setMode(null)
    setNotice("Cargo registrado en la cuenta de fiado y en Historial_Abonos.")
  }

  const pay = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const val = Number(amount)
    if (val <= 0 || val > selected.Saldo_Deudor) {
      setNotice(
        "El abono debe ser mayor a $0.00 y no superar el saldo deudor actual.",
      )
      return
    }
    setCredits((rows) =>
      rows.map((row) =>
        row.Id_Fiado === selected.Id_Fiado
          ? {
            ...row,
            Saldo_Deudor: Number((row.Saldo_Deudor - val).toFixed(2)),
            Estado_Credito:
              row.Estado_Credito === "Suspendido" ? "Suspendido" : "Activo",
          }
          : row,
      ),
    )
    addHistory(selected, "Abono Parcial", val, "Maricela Hernández Ríos")
    setMode(null)
    setNotice("Abono parcial registrado y saldo deudor actualizado.")
  }

  const liquidate = (credit: CreditAccount) => {
    if (
      !window.confirm(
        `¿Confirmar pago total y liquidar la deuda de ${fmt(credit.Saldo_Deudor)}?`,
      )
    )
      return
    addHistory(
      credit,
      "Liquidación Total",
      credit.Saldo_Deudor,
      "Maricela Hernández Ríos",
    )
    setCredits((rows) =>
      rows.map((row) =>
        row.Id_Fiado === credit.Id_Fiado
          ? { ...row, Saldo_Deudor: 0, Estado_Credito: "Activo" }
          : row,
      ),
    )
    setNotice("¡Deuda liquidada al 100%! El saldo deudor quedó en $0.00.")
  }

  const remove = (credit: CreditAccount) => {
    if (credit.Saldo_Deudor > 0) {
      setNotice(
        `No se puede eliminar la cuenta ${credit.Id_Fiado} porque mantiene un saldo deudor activo de ${fmt(credit.Saldo_Deudor)} . Primero liquida la deuda o suspende el crédito.`,
      )
      return
    }
    if (window.confirm(`¿Eliminar permanentemente la cuenta de fiado ${credit.Id_Fiado}?`)) {
      setCredits((rows) =>
        rows.filter((row) => row.Id_Fiado !== credit.Id_Fiado),
      )
      setNotice(`Cuenta de fiado ${credit.Id_Fiado} eliminada correctamente.`)
    }
  }

  const openModal = (
    next: "charge" | "payment" | "history",
    credit: CreditAccount,
  ) => {
    setSelected(credit)
    setAmount("")
    setPin("")
    setThirdParty(false)
    setMode(next)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-foreground)",
            }}
          >
            Fiados y Cuentas de Crédito (3NF)
          </h2>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            JOIN Usuario.Id_Usuario → Fiado.Id_Usuario · Altas, cargos, abonos, liquidaciones y bajas
          </p>
        </div>
        <AdminButton onClick={() => setMode("new")}>
          <IconPlus className="h-4 w-4" /> Nuevo Fiado
        </AdminButton>
      </div>

      {notice && (
        <p
          role="alert"
          className="rounded-xl p-3 text-sm font-bold"
          style={
            notice.includes("excedido") ||
              notice.includes("No se puede") ||
              notice.includes("no autorizado") ||
              notice.includes("suspendido")
              ? { background: "#fde8e8", color: "#991b1b" }
              : {
                background: "var(--color-secondary)",
                color: "var(--color-secondary-foreground)",
              }
          }
        >
          {notice}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {credits.map((credit) => {
          const user = userFor(credit)
          const available = Math.max(
            0,
            credit.Limite_Credito - credit.Saldo_Deudor,
          )
          return (
            <article
              key={credit.Id_Fiado}
              className="rounded-2xl border p-5"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className="text-lg font-bold"
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    {user.Nombre_Completo}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {user.Telefono} · {user.Direccion} · PIN terceros:{" "}
                    <strong>{user.Codigo_Seguridad}</strong>
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                  style={
                    credit.Estado_Credito === "Activo"
                      ? { background: "#e6f7ee", color: "#1a7a45" }
                      : { background: "#fde8e8", color: "#991b1b" }
                  }
                >
                  {credit.Estado_Credito}
                </span>
              </div>

              <div
                className="my-4 grid grid-cols-2 gap-2 rounded-xl p-3 text-xs"
                style={{ background: "var(--color-secondary)" }}
              >
                <p>
                  <strong>PK: Id_Fiado</strong>
                  <br />
                  {credit.Id_Fiado}
                </p>
                <p>
                  <strong>FK: Id_Usuario</strong>
                  <br />
                  {credit.Id_Usuario}
                </p>
                <p>
                  Límite de crédito
                  <br />
                  <strong>{fmt(credit.Limite_Credito)}</strong>
                </p>
                <p>
                  Saldo deudor
                  <br />
                  <strong style={{ color: "var(--color-primary)" }}>
                    {fmt(credit.Saldo_Deudor)}
                  </strong>
                </p>
                <p>
                  Disponible para fiar
                  <br />
                  <strong>{fmt(available)}</strong>
                </p>
                <p>
                  Fecha límite
                  <br />
                  <strong>{credit.Fecha_Limite_Pago}</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <AdminButton small onClick={() => openModal("charge", credit)}>
                  🛒 Cargar a cuenta
                </AdminButton>
                {credit.Saldo_Deudor > 0 && (
                  <>
                    <AdminButton
                      small
                      secondary
                      onClick={() => openModal("payment", credit)}
                    >
                      💵 Abonar
                    </AdminButton>
                    <AdminButton
                      small
                      secondary
                      onClick={() => liquidate(credit)}
                    >
                      ✅ Liquidar Todo ({fmt(credit.Saldo_Deudor)})
                    </AdminButton>
                  </>
                )}
                <AdminButton
                  small
                  secondary
                  onClick={() => openModal("history", credit)}
                >
                  📜 Historial
                </AdminButton>
                <AdminButton
                  small
                  secondary
                  onClick={() =>
                    setCredits((rows) =>
                      rows.map((row) =>
                        row.Id_Fiado === credit.Id_Fiado
                          ? { ...row, Estado_Credito: "Suspendido" }
                          : row,
                      ),
                    )
                  }
                >
                  ⏸️ Suspender
                </AdminButton>
                {canDelete && <AdminButton small danger onClick={() => remove(credit)}>
                  🗑️ Eliminar
                </AdminButton>}
              </div>
            </article>
          )
        })}
      </div>

      {mode && (
        <AdminModal
          title={
            mode === "new"
              ? "Agregar Nuevo Fiado"
              : mode === "charge"
                ? `Cargar compra a cuenta · ${selected?.Id_Fiado}`
                : mode === "payment"
                  ? `Registrar abono a cuenta · ${selected?.Id_Fiado}`
                  : `Historial de Movimientos · ${selected?.Id_Fiado}`
          }
          onClose={() => setMode(null)}
        >
          {mode === "new" ? (
            <form onSubmit={addCredit} className="grid gap-3">
              <FormField label="Seleccionar Usuario (FK Id_Usuario) o registrar nuevo consumidor">
                <select
                  className={controlClass}
                  style={controlStyle}
                  value={newExisting}
                  onChange={(e) => setNewExisting(e.target.value)}
                >
                  <option value="new">➕ Registrar nuevo consumidor en tabla Usuario</option>
                  {users
                    .filter(
                      (user) =>
                        !credits.some(
                          (credit) => credit.Id_Usuario === user.Id_Usuario,
                        ),
                    )
                    .map((user) => (
                      <option key={user.Id_Usuario} value={user.Id_Usuario}>
                        {user.Id_Usuario} · {user.Nombre_Completo}
                      </option>
                    ))}
                </select>
              </FormField>

              {newExisting === "new" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Nombre_Completo">
                    <input
                      required
                      className={controlClass}
                      style={controlStyle}
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Telefono">
                    <input
                      required
                      className={controlClass}
                      style={controlStyle}
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Direccion">
                    <input
                      required
                      className={controlClass}
                      style={controlStyle}
                      value={newUser.address}
                      onChange={(e) =>
                        setNewUser({ ...newUser, address: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Codigo_Seguridad (PIN 4 dígitos)">
                    <input
                      required
                      maxLength={4}
                      placeholder="Ej. 4821"
                      className={controlClass}
                      style={controlStyle}
                      value={newUser.pin}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          pin: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </FormField>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Limite_Credito ($)">
                  <input
                    required
                    type="number"
                    min="1"
                    className={controlClass}
                    style={controlStyle}
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </FormField>
                <FormField label="Fecha_Limite_Pago">
                  <input
                    required
                    type="date"
                    className={controlClass}
                    style={controlStyle}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </FormField>
              </div>
              <AdminButton type="submit">Crear cuenta de fiado</AdminButton>
            </form>
          ) : mode === "history" ? (
            <div className="space-y-2">
              {history
                .filter((row) => row.Id_Fiado === selected?.Id_Fiado)
                .map((row) => (
                  <div
                    key={row.Id_Movimiento}
                    className="rounded-xl p-3 text-sm"
                    style={{ background: "var(--color-secondary)" }}
                  >
                    <strong>{row.Tipo}</strong> · {fmt(row.Monto)}
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {row.Id_Movimiento} · {row.Fecha} · Autorizado:{" "}
                      {row.Autorizado_Por}
                    </p>
                  </div>
                ))}
              {!history.some((row) => row.Id_Fiado === selected?.Id_Fiado) && (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Sin movimientos registrados todavía para esta cuenta.
                </p>
              )}
            </div>
          ) : (
            <form
              onSubmit={mode === "charge" ? charge : pay}
              className="grid gap-3"
            >
              <FormField
                label={
                  mode === "charge"
                    ? `Monto de la compra a fiar (Disponible: ${fmt((selected?.Limite_Credito || 0) - (selected?.Saldo_Deudor || 0))})`
                    : `Monto del abono a ingresar (Saldo deudor actual: ${fmt(selected?.Saldo_Deudor || 0)})`
                }
              >
                <input
                  autoFocus
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={controlClass}
                  style={controlStyle}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </FormField>
              {mode === "charge" && (
                <>
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={thirdParty}
                      onChange={(e) => setThirdParty(e.target.checked)}
                    />
                    Acude un tercero o familiar autorizado
                  </label>
                  {thirdParty && (
                    <FormField label="Ingresa el Codigo_Seguridad (PIN) del titular">
                      <input
                        required
                        maxLength={4}
                        className={controlClass}
                        style={controlStyle}
                        value={pin}
                        onChange={(e) =>
                          setPin(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </FormField>
                  )}
                </>
              )}
              <div className="flex flex-wrap gap-2">
                <AdminButton type="submit">
                  {mode === "charge" ? "Registrar cargo a cuenta" : "Aplicar abono"}
                </AdminButton>
                {mode === "payment" && selected && selected.Saldo_Deudor > 0 && (
                  <AdminButton
                    secondary
                    onClick={() => {
                      const target = selected
                      setMode(null)
                      liquidate(target)
                    }}
                  >
                    ✅ Pagar todo ({fmt(selected.Saldo_Deudor)})
                  </AdminButton>
                )}
              </div>
            </form>
          )}
        </AdminModal>
      )}
    </div>
  )
}

function AdminDashboard({
  products,
  dailyCuts,
  fiados: initFiados,
  egresos: initEgresos,
  inventory,
  setInventory,
  seasons,
  setSeasons,
  users,
  setUsers,
  credits,
  setCredits,
  creditHistory,
  setCreditHistory,
  orders,
  setOrders,
  orderDetails: details,
  onGoPOS,
  onLogout,
}: {
  products: Product[]
  dailyCuts: DailyCut[]
  fiados: FiadoClient[]
  egresos: EgresoRecord[]
  inventory: InventoryItem[]
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
  seasons: SeasonAccount[]
  setSeasons: React.Dispatch<React.SetStateAction<SeasonAccount[]>>
  users: CreditUser[]
  setUsers: React.Dispatch<React.SetStateAction<CreditUser[]>>
  credits: CreditAccount[]
  setCredits: React.Dispatch<React.SetStateAction<CreditAccount[]>>
  creditHistory: CreditMovement[]
  setCreditHistory: React.Dispatch<React.SetStateAction<CreditMovement[]>>
  orders: AdminSale[]
  setOrders: React.Dispatch<React.SetStateAction<AdminSale[]>>
  orderDetails: SaleDetail3NF[]
  onGoPOS: () => void
  onLogout: () => void
}) {
  const [tab, setTab] = useState<AdminTab>("overview")
  const [intent, setIntent] = useState<AdminIntent>(null)
  const [actionQuery, setActionQuery] = useState("")
  const [preview, setPreview] = useState<
    "debtors" | "stock" | "cut" | "orders" | "expenses" | "seasons" | null
  >(null)

  const [losses, setLosses] = useState<Loss3NF[]>(() =>
    initEgresos
      .filter((e) => e.type === "productos-danados")
      .map((e, index) => ({
        Id_Perdidas: `PER-${String(index + 1).padStart(3, "0")}`,
        Id_Producto: `PR-${String(
          products.find((p) => p.name === e.productName)?.id || 1,
        ).padStart(3, "0")}`,
        Tipo_Perdida: "Caducidad / Daño",
        Descripcion: e.description,
        Monto: e.amount,
        Fecha: e.date,
      })),
  )

  const [expenses, setExpenses] = useState(
    initEgresos.filter((e) => e.type !== "productos-danados"),
  )

  const [lossDraft, setLossDraft] = useState({
    product: "PR-001",
    type: "Caducidad",
    description: "",
    amount: "",
    date: "2026-09-04",
  })

  const [expenseDraft, setExpenseDraft] = useState({
    type: "consumo-interno" as "consumo-interno" | "gastos-produccion",
    description: "",
    amount: "",
    date: "2026-09-04",
  })

  const [seasonDraft, setSeasonDraft] = useState({
    name: "",
    cost: "",
    sales: "",
  })
  const [seasonUse, setSeasonUse] = useState({ seasonId: "TEMP-002", productId: "PR-001", qty: "" })

  const critical = inventory.filter((item) => item.Stock <= 6)
  const revenue = orders
    .filter((order) => order.estado === "Completado")
    .reduce((sum, order) => sum + order.total_Pagar, 0)
  const totalLoss = losses.reduce((sum, row) => sum + row.Monto, 0)
  const totalInternal = expenses
    .filter((row) => row.type === "consumo-interno")
    .reduce((sum, row) => sum + row.amount, 0)
  const totalExpense = expenses.reduce((sum, row) => sum + row.amount, 0)
  const lastCut =
    dailyCuts.length > 0 ? dailyCuts[dailyCuts.length - 1] : undefined

  const navigate = (next: AdminTab, nextIntent: AdminIntent = null) => {
    setIntent(nextIntent)
    setTab(next)
  }

  const actions = [
    {
      title: "🖥️ Ir a Caja / Cobrar en Mostrador",
      text: "Abrir el punto de venta conservando permisos de administradora.",
      go: onGoPOS,
      quick: "Abrir caja",
      quickGo: onGoPOS,
    },
    {
      title: "📦 Gestionar Catálogo e Inventario Omnibox (1,245 SKUs)",
      text: "Buscar por código EAN-13 o nombre, ajustar stock, habilitar y actualizar precios (+30%).",
      go: () => navigate("inventario", "inventory-focus"),
      quick: "Ver productos por agotarse",
      quickGo: () => setPreview("stock"),
    },
    {
      title: "🚨 Ver Alertas de Stock Crítico (≤ 6 unidades)",
      text: "Filtrar productos con pocas existencias y enviar alerta al celular.",
      go: () => navigate("inventario", "inventory-critical"),
      quick: "Ver productos por agotarse",
      quickGo: () => setPreview("stock"),
    },
    {
      title: "💳 Administrar Fiados y Cuentas de Crédito",
      text: "Agregar fiados, cargar compras a su cuenta, registrar abonos, liquidar todo o eliminar.",
      go: () => navigate("fiados"),
      quick: "Ver deudores actuales",
      quickGo: () => setPreview("debtors"),
    },
    {
      title: "🛍️ Supervisar Pedidos Web (Límite 30 min) y Ventas",
      text: "Revisar recolecciones en tienda y consultar Detalle_Venta con Precio_Venta_Historico.",
      go: () => navigate("pedidos"),
      quick: "Ver pedidos pendientes",
      quickGo: () => setPreview("orders"),
    },
    {
      title: "✂️ Revisar Cortes de Caja Diarios",
      text: "Auditar fondo inicial, ventas del turno y efectivo entregado por las socias.",
      go: () => navigate("cortes"),
      quick: "Ver último corte",
      quickGo: () => setPreview("cut"),
    },
    {
      title: "📉 Registrar Mermas y Consumo Interno",
      text: "Capturar pérdidas por daño/caducidad y consumo familiar.",
      go: () => navigate("egresos"),
      quick: "Ver resumen de egresos",
      quickGo: () => setPreview("expenses"),
    },
    {
      title: "🎃 Ventas por Temporada (Cuenta Separada) y Análisis Mensual",
      text: "Comparar mermas vs. consumo interno y administrar eventos en cuenta aparte .",
      go: () => navigate("analisis"),
      quick: "Ver temporadas",
      quickGo: () => setPreview("seasons"),
    },
  ].filter((action) =>
    action.title.toLowerCase().includes(actionQuery.toLowerCase()),
  )

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "overview", label: "Inicio" },
    { key: "inventario", label: "Inventario" },
    { key: "pedidos", label: "Pedidos / Ventas" },
    { key: "cortes", label: "Cortes diarios" },
    { key: "fiados", label: "Fiados" },
    { key: "egresos", label: "Egresos" },
    { key: "analisis", label: "Análisis mensual" },
  ]

  const changeStatus = (id: string, status: AdminSale["estado"]) =>
    setOrders((rows) =>
      rows.map((row) =>
        row.Id_folio_Venta === id ? { ...row, estado: status } : row,
      ),
    )

  const addLoss = (event: React.FormEvent) => {
    event.preventDefault()
    setLosses((rows) => [
      ...rows,
      {
        Id_Perdidas: `PER-${String(rows.length + 1).padStart(3, "0")}`,
        Id_Producto: lossDraft.product,
        Tipo_Perdida: lossDraft.type,
        Descripcion: lossDraft.description,
        Monto: Number(lossDraft.amount),
        Fecha: lossDraft.date,
      },
    ])
    setLossDraft({ ...lossDraft, description: "", amount: "" })
  }

  const addExpense = (event: React.FormEvent) => {
    event.preventDefault()
    setExpenses((rows) => [
      ...rows,
      {
        id: rows.length + 20,
        type: expenseDraft.type,
        description: expenseDraft.description,
        amount: Number(expenseDraft.amount),
        date: expenseDraft.date,
      },
    ])
    setExpenseDraft({ ...expenseDraft, description: "", amount: "" })
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white"
              style={{ background: "var(--color-primary)" }}
            >
              M
            </span>
            <div>
              <p
                className="font-bold"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-foreground)",
                }}
              >
                Abarrotes González
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Panel Administrador · Maricela Hernández Ríos
              </p>
            </div>
          </div>

          {critical.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("inventario", "inventory-critical")}
              className="rounded-xl px-3 py-2 text-xs font-bold"
              style={{
                background: "var(--color-secondary)",
                color: "var(--color-primary)",
              }}
            >
              <IconBell className="mr-1 inline h-4 w-4" />
              {critical.length} alertas de stock crítico
            </button>
          )}

          <div className="ml-auto flex gap-2">
            <AdminButton small onClick={onGoPOS}>
              🖥️ Ir a Caja / Cobrar en Mostrador (RF-09)
            </AdminButton>
            <AdminButton small secondary onClick={onLogout}>
              <IconUser className="h-4 w-4" /> Salir
            </AdminButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-5 md:flex-row">
        <nav className="flex gap-1 overflow-x-auto md:w-48 md:shrink-0 md:flex-col">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className="shrink-0 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition"
              style={
                tab === item.key
                  ? { background: "var(--color-primary)", color: "#ffffff" }
                  : { color: "var(--color-muted-foreground)" }
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          {tab === "overview" && (
            <div className="flex flex-col gap-6">
              <section
                className="rounded-3xl p-6 text-white sm:p-8"
                style={{ background: "var(--color-primary)" }}
              >
                <p className="text-sm font-bold opacity-80">
                  CENTRO DE CONTROL SGAG · 3NF
                </p>
                <h1
                  className="mt-1 max-w-3xl text-3xl font-bold sm:text-4xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  ¡Hola, Maricela! ¿Qué quieres hacer hoy?
                </h1>
                <div className="relative mt-5 max-w-2xl">
                  <IconSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/60" />
                  <input
                    value={actionQuery}
                    onChange={(e) => setActionQuery(e.target.value)}
                    placeholder="Buscar qué quieres ver o hacer hoy: inventario, fiados, cortes, mermas..."
                    className="min-h-12 w-full rounded-2xl pl-12 pr-4 text-sm outline-none"
                    style={{
                      background: "var(--color-card)",
                      color: "var(--color-foreground)",
                    }}
                  />
                </div>
              </section>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { kpiVal: "1,245", label: "SKUs activos en catálogo" },
                  { kpiVal: fmt(revenue), label: "Ventas completadas" },
                  {
                    kpiVal: String(critical.length),
                    label: "Alertas de stock (≤ 6)",
                  },
                  {
                    kpiVal: fmt(totalLoss + totalExpense),
                    label: "Egresos y mermas",
                  },
                ].map(({ kpiVal, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl border p-4"
                    style={{
                      background: "var(--color-card)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <p
                      className="text-2xl font-extrabold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {kpiVal}
                    </p>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {preview && (
                <section
                  className="rounded-2xl border-2 p-5"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--color-foreground)",
                      }}
                    >
                      Apartado de Consulta Rápida
                    </h2>
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="p-2"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      <IconX />
                    </button>
                  </div>

                  {preview === "stock" && (
                    <div className="grid gap-2">
                      {critical.map((item) => (
                        <p
                          key={item.Id_Producto}
                          className="rounded-xl p-3 text-sm"
                          style={{ background: "#fde8e8", color: "#991b1b" }}
                        >
                          <strong>
                            {item.Id_Producto} · {item.Nombre_Producto}
                          </strong>{" "}
                          — Quedan {item.Stock} {item.Unidad_Medida}
                        </p>
                      ))}
                    </div>
                  )}

                  {preview === "debtors" && (
                    <div className="grid gap-2">
                      {credits.map((row) => (
                        <p
                          key={row.Id_Fiado}
                          className="rounded-xl p-3 text-sm"
                          style={{ background: "var(--color-secondary)" }}
                        >
                          <strong>{users.find((user) => user.Id_Usuario === row.Id_Usuario)?.Nombre_Completo || row.Id_Usuario}</strong> · Debe{" "}
                          <strong style={{ color: "var(--color-primary)" }}>
                            {fmt(row.Saldo_Deudor)}
                          </strong>{" "}
                          · Límite {fmt(row.Limite_Credito)}
                        </p>
                      ))}
                    </div>
                  )}

                  {preview === "cut" && (
                    <div
                      className="rounded-xl p-4 text-sm"
                      style={{ background: "var(--color-secondary)" }}
                    >
                      Último corte: <strong>{lastCut?.date || "—"}</strong> ·
                      Efectivo entregado:{" "}
                      <strong>{fmt(lastCut?.closing || 0)}</strong> · Socia:{" "}
                      {lastCut?.employee || "—"}
                    </div>
                  )}

                  {preview === "orders" && (
                    <div className="grid gap-2">
                      {orders
                        .filter((row) => row.estado === "Pendiente")
                        .map((row) => (
                          <p
                            key={row.Id_folio_Venta}
                            className="rounded-xl p-3 text-sm"
                            style={{ background: "var(--color-secondary)" }}
                          >
                            <strong>{row.Id_folio_Venta}</strong> ·{" "}
                            {fmt(row.total_Pagar)} · Horario límite:{" "}
                            {row.horario_Recoleccion}
                          </p>
                        ))}
                    </div>
                  )}

                  {preview === "expenses" && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <p
                        className="rounded-xl p-3 text-sm"
                        style={{ background: "var(--color-secondary)" }}
                      >
                        Mermas (Productos dañados):{" "}
                        <strong>{fmt(totalLoss)}</strong>
                      </p>
                      <p
                        className="rounded-xl p-3 text-sm"
                        style={{ background: "var(--color-secondary)" }}
                      >
                        Consumo interno familiar:{" "}
                        <strong>{fmt(totalInternal)}</strong>
                      </p>
                    </div>
                  )}

                  {preview === "seasons" && (
                    <div className="grid gap-2">
                      {seasons.map((row) => (
                        <p
                          key={row.Id_Temporada}
                          className="rounded-xl p-3 text-sm"
                          style={{ background: "var(--color-secondary)" }}
                        >
                          <strong>{row.Nombre_Temporada}</strong> · Ventas:{" "}
                          {fmt(row.Ventas_Temporada)} · Ganancia Neta:{" "}
                          <strong>{fmt(row.Ganancia_Neta)}</strong>
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    Puntos de acción de la clienta
                  </h2>
                  <AdminButton
                    small
                    onClick={() => navigate("inventario", "inventory-new")}
                  >
                    <IconPlus className="h-4 w-4" /> Dar de alta producto (+30%)
                  </AdminButton>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {actions.map((action) => (
                    <article
                      key={action.title}
                      onClick={action.go}
                      className="cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        background: "var(--color-card)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <h3
                        className="font-bold"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {action.title}
                      </h3>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {action.text}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <AdminButton
                          small
                          onClick={(e) => {
                            e.stopPropagation()
                            action.go()
                          }}
                        >
                          Ir al apartado
                        </AdminButton>
                        <AdminButton
                          small
                          secondary
                          onClick={(e) => {
                            e.stopPropagation()
                            action.quickGo()
                          }}
                        >
                          👁️ {action.quick}
                        </AdminButton>
                        {action.title.includes("Fiados") && (
                          <>
                            <AdminButton
                              small
                              secondary
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate("fiados", "fiado-new")
                              }}
                            >
                              ➕ Nuevo Fiado
                            </AdminButton>
                            <AdminButton
                              small
                              secondary
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate("fiados", "fiado-charge")
                              }}
                            >
                              🛒 Cargar compra
                            </AdminButton>
                            <AdminButton
                              small
                              secondary
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate("fiados", "fiado-payment")
                              }}
                            >
                              💵 Abonar / Liquidar
                            </AdminButton>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === "inventario" && (
            <InventoryOmnibox
              inventory={inventory}
              setInventory={setInventory}
              details={details}
              losses={losses}
              intent={intent}
              clearIntent={() => setIntent(null)}
              seasons={seasons}
              setSeasons={setSeasons}
              updateProductInFirestore={updateProductInFirestore}
              saveNewProductInFirestore={saveNewProductInFirestore}
            />
          )}

          {tab === "fiados" && (
            <FiadosModule
              intent={intent}
              clearIntent={() => setIntent(null)}
              users={users}
              setUsers={setUsers}
              credits={credits}
              setCredits={setCredits}
              history={creditHistory}
              setHistory={setCreditHistory}
            />
          )}

          {tab === "pedidos" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Ventas y Pedidos Web (3NF)
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Tablas Ventas y Detalle_Venta separadas  · Recolección física dentro de 30 minutos
                </p>
              </div>

              <section>
                <h3
                  className="mb-3 font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  Tabla Ventas
                </h3>
                <div
                  className="overflow-x-auto rounded-2xl border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead style={{ background: "var(--color-secondary)" }}>
                      <tr>
                        {[
                          "Id_folio_Venta (PK)",
                          "Id_Usuario (FK)",
                          "total_Pagar",
                          "estado",
                          "horario_Recoleccion",
                          "fecha_Hora",
                          "Acciones",
                        ].map((h) => (
                          <th key={h} className="px-4 py-3 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.Id_folio_Venta}
                          className="border-t"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <td
                            className="px-4 py-3 font-bold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {order.Id_folio_Venta}
                          </td>
                          <td className="px-4 py-3">{order.Id_Usuario}</td>
                          <td className="px-4 py-3 font-bold">
                            {fmt(order.total_Pagar)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-bold"
                              style={
                                order.estado === "Pendiente"
                                  ? { background: "#fff3cd", color: "#7a5c00" }
                                  : order.estado === "Completado"
                                    ? { background: "#e6f7ee", color: "#1a7a45" }
                                    : { background: "#fde8e8", color: "#991b1b" }
                              }
                            >
                              {order.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.horario_Recoleccion}
                          </td>
                          <td className="px-4 py-3">{order.fecha_Hora}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {order.estado === "Pendiente" && (
                                <>
                                  <AdminButton
                                    small
                                    onClick={() =>
                                      changeStatus(
                                        order.Id_folio_Venta,
                                        "Completado",
                                      )
                                    }
                                  >
                                    Entregado
                                  </AdminButton>
                                  <AdminButton
                                    small
                                    danger
                                    onClick={() =>
                                      changeStatus(
                                        order.Id_folio_Venta,
                                        "Cancelado",
                                      )
                                    }
                                  >
                                    Cancelar
                                  </AdminButton>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3
                  className="mb-1 font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  Tabla Detalle_Venta (3NF)
                </h3>
                <p
                  className="mb-3 text-xs"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Llave compuesta PK/FK: Id_Folio_Venta + Id_Producto. Precio_Venta_Historico estático (el subtotal se calcula en vista para cumplir la 3NF).
                </p>
                <div
                  className="overflow-x-auto rounded-2xl border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead style={{ background: "var(--color-secondary)" }}>
                      <tr>
                        {[
                          "Id_Folio_Venta (PK/FK)",
                          "Id_Producto (PK/FK)",
                          "Cantidad",
                          "Precio_Venta_Historico",
                          "Subtotal (Calculado)",
                        ].map((h) => (
                          <th key={h} className="px-4 py-3 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((detail) => (
                        <tr
                          key={`${detail.Id_Folio_Venta}-${detail.Id_Producto}`}
                          className="border-t"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <td className="px-4 py-3">{detail.Id_Folio_Venta}</td>
                          <td className="px-4 py-3">{detail.Id_Producto}</td>
                          <td className="px-4 py-3">{detail.Cantidad}</td>
                          <td className="px-4 py-3">
                            {fmt(detail.Precio_Venta_Historico)}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {fmt(
                              detail.Cantidad * detail.Precio_Venta_Historico,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {tab === "cortes" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Cortes diarios de caja
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Auditoría de fondo inicial, ventas del turno y efectivo entregado por las socias (RF-08).
                </p>
              </div>
              {dailyCuts.map((cut) => (
                <article
                  key={cut.date}
                  className="rounded-2xl border p-5"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="font-bold"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {cut.date}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        Socia responsable: {cut.employee}
                      </p>
                    </div>
                    <p
                      className="text-xl font-extrabold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {fmt(cut.closing)}
                    </p>
                    {cut.difference !== undefined && <span className={`rounded-full px-2 py-1 text-xs font-bold ${cut.difference === 0 ? "bg-green-50 text-green-700" : cut.difference < 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{cut.difference === 0 ? "Cuadre exacto" : cut.difference < 0 ? `Faltante ${fmt(Math.abs(cut.difference))}` : `Sobrante ${fmt(cut.difference)}`}</span>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Fondo inicial", val: cut.opening },
                      { label: "Ventas del turno", val: cut.sales },
                      { label: "Egresos", val: cut.expenses },
                      { label: "Efectivo esperado", val: cut.expected ?? cut.opening + cut.sales - cut.expenses },
                      { label: "Efectivo entregado", val: cut.closing },
                    ].map(({ label, val }) => (
                      <div
                        key={label}
                        className="rounded-xl p-3"
                        style={{ background: "var(--color-secondary)" }}
                      >
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {label}
                        </p>
                        <p
                          className="font-bold"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {fmt(val)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === "egresos" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Pérdidas (Mermas) y Consumo Interno
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Tabla Perdidas en 3NF y registro de Consumo Interno familiar (RF-22).
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <form
                  onSubmit={addLoss}
                  className="rounded-2xl border p-5"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h3
                    className="mb-4 font-bold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    Registrar producto dañado / caducado (Tabla Perdidas)
                  </h3>
                  <div className="grid gap-3">
                    <FormField label="Id_Producto (FK)">
                      <select
                        className={controlClass}
                        style={controlStyle}
                        value={lossDraft.product}
                        onChange={(e) =>
                          setLossDraft({
                            ...lossDraft,
                            product: e.target.value,
                          })
                        }
                      >
                        {inventory.map((item) => (
                          <option
                            key={item.Id_Producto}
                            value={item.Id_Producto}
                          >
                            {item.Id_Producto} · {item.Nombre_Producto}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Tipo_Perdida">
                      <select
                        className={controlClass}
                        style={controlStyle}
                        value={lossDraft.type}
                        onChange={(e) =>
                          setLossDraft({ ...lossDraft, type: e.target.value })
                        }
                      >
                        <option value="Caducidad">Caducidad</option>
                        <option value="Daño / Rotura">Daño / Rotura</option>
                        <option value="Roto / Merma">Roto / Merma</option>
                      </select>
                    </FormField>
                    <FormField label="Descripcion">
                      <input
                        required
                        className={controlClass}
                        style={controlStyle}
                        value={lossDraft.description}
                        onChange={(e) =>
                          setLossDraft({
                            ...lossDraft,
                            description: e.target.value,
                          })
                        }
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Monto ($)">
                        <input
                          required
                          type="number"
                          step="0.01"
                          className={controlClass}
                          style={controlStyle}
                          value={lossDraft.amount}
                          onChange={(e) =>
                            setLossDraft({
                              ...lossDraft,
                              amount: e.target.value,
                            })
                          }
                        />
                      </FormField>
                      <FormField label="Fecha">
                        <input
                          type="date"
                          className={controlClass}
                          style={controlStyle}
                          value={lossDraft.date}
                          onChange={(e) =>
                            setLossDraft({ ...lossDraft, date: e.target.value })
                          }
                        />
                      </FormField>
                    </div>
                    <AdminButton type="submit">
                      Registrar en Perdidas
                    </AdminButton>
                  </div>
                </form>

                <form
                  onSubmit={addExpense}
                  className="rounded-2xl border p-5"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h3
                    className="mb-4 font-bold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    Registrar Consumo Interno Familiar (RF-22)
                  </h3>
                  <div className="grid gap-3">
                    <FormField label="Clasificación">
                      <select
                        className={controlClass}
                        style={controlStyle}
                        value={expenseDraft.type}
                        onChange={(e) =>
                          setExpenseDraft({
                            ...expenseDraft,
                            type: e.target.value as typeof expenseDraft.type,
                          })
                        }
                      >
                        <option value="consumo-interno">
                          Consumo Interno Familiar (RF-22)
                        </option>
                        <option value="gastos-produccion">
                          Otro gasto operativo
                        </option>
                      </select>
                    </FormField>
                    <FormField label="Descripcion">
                      <input
                        required
                        className={controlClass}
                        style={controlStyle}
                        value={expenseDraft.description}
                        onChange={(e) =>
                          setExpenseDraft({
                            ...expenseDraft,
                            description: e.target.value,
                          })
                        }
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Monto ($)">
                        <input
                          required
                          type="number"
                          step="0.01"
                          className={controlClass}
                          style={controlStyle}
                          value={expenseDraft.amount}
                          onChange={(e) =>
                            setExpenseDraft({
                              ...expenseDraft,
                              amount: e.target.value,
                            })
                          }
                        />
                      </FormField>
                      <FormField label="Fecha">
                        <input
                          type="date"
                          className={controlClass}
                          style={controlStyle}
                          value={expenseDraft.date}
                          onChange={(e) =>
                            setExpenseDraft({
                              ...expenseDraft,
                              date: e.target.value,
                            })
                          }
                        />
                      </FormField>
                    </div>
                    <AdminButton type="submit">Registrar salida</AdminButton>
                  </div>
                </form>
              </div>

              <section>
                <h3
                  className="mb-3 font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  Tabla Perdidas (3NF)
                </h3>
                <div
                  className="overflow-x-auto rounded-2xl border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead style={{ background: "var(--color-secondary)" }}>
                      <tr>
                        {[
                          "Id_Perdidas (PK)",
                          "Id_Producto (FK)",
                          "Tipo_Perdida",
                          "Descripcion",
                          "Monto",
                          "Fecha",
                        ].map((h) => (
                          <th key={h} className="px-4 py-3 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {losses.map((row) => (
                        <tr
                          key={row.Id_Perdidas}
                          className="border-t"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <td className="px-4 py-3 font-bold">
                            {row.Id_Perdidas}
                          </td>
                          <td className="px-4 py-3">{row.Id_Producto}</td>
                          <td className="px-4 py-3">{row.Tipo_Perdida}</td>
                          <td className="px-4 py-3">{row.Descripcion}</td>
                          <td className="px-4 py-3">{fmt(row.Monto)}</td>
                          <td className="px-4 py-3">{row.Fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {tab === "analisis" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Análisis Mensual y Temporadas (Cuenta Separada)
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Comparativo de mermas vs. consumo interno (RF-22) y cuenta independiente de temporadas (RF-23).
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Mermas por daño/caducidad", val: totalLoss },
                  { label: "Consumo interno familiar", val: totalInternal },
                  {
                    label: "Diferencia mensual",
                    val: Math.abs(totalLoss - totalInternal),
                  },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="rounded-2xl border p-5"
                    style={{
                      background: "var(--color-card)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-2xl font-extrabold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {fmt(val)}
                    </p>
                    <div
                      className="mt-3 h-2 rounded-full"
                      style={{ background: "var(--color-secondary)" }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{
                          background: "var(--color-primary)",
                          width: `${Math.min(
                            100,
                            (val / Math.max(totalLoss, totalInternal, 1)) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <section
                className="rounded-2xl border p-5"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-foreground)",
                  }}
                >
                  Ventas por Temporada en Cuenta Separada (RF-23)
                </h3>
                <p
                  className="mb-4 text-xs"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Los insumos utilizados en eventos de temporada se registran como inversión y no como merma.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSeasons((rows) => [
                      ...rows,
                      {
                        Id_Temporada: `TEMP-${String(rows.length + 1).padStart(
                          3,
                          "0",
                        )}`,
                        Nombre_Temporada: seasonDraft.name,
                        Costo_Insumos: 0,
                        Ventas_Temporada: 0,
                        Ganancia_Neta: 0,
                      },
                    ])
                    setSeasonDraft({ name: "", cost: "", sales: "" })
                  }}
                  className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <FormField label="Nombre_Temporada">
                    <input
                      required
                      placeholder="Ej. Día de Reyes"
                      className={controlClass}
                      style={controlStyle}
                      value={seasonDraft.name}
                      onChange={(e) =>
                        setSeasonDraft({ ...seasonDraft, name: e.target.value })
                      }
                    />
                  </FormField>
                  <div className="flex items-end">
                    <AdminButton type="submit">Agregar temporada</AdminButton>
                  </div>
                </form>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const qty = Number(seasonUse.qty)
                  const product = inventory.find((item) => item.Id_Producto === seasonUse.productId)
                  if (!product || qty <= 0 || qty > product.Stock) return
                  const investment = Number((qty * product.Costo_Adquisicion).toFixed(2))
                  setInventory((rows) => rows.map((item) => item.Id_Producto === product.Id_Producto ? { ...item, Stock: Number((item.Stock - qty).toFixed(3)), Temporada: seasons.find((season) => season.Id_Temporada === seasonUse.seasonId)?.Nombre_Temporada || item.Temporada } : item))
                  setSeasons((rows) => rows.map((season) => season.Id_Temporada === seasonUse.seasonId ? { ...season, Costo_Insumos: season.Costo_Insumos + investment, Ganancia_Neta: season.Ventas_Temporada - season.Costo_Insumos - investment } : season))
                  setSeasonUse({ ...seasonUse, qty: "" })
                }} className="mb-5 grid gap-3 rounded-xl p-4 sm:grid-cols-4" style={{ background: "var(--color-secondary)" }}>
                  <FormField label="Temporada"><select className={controlClass} style={controlStyle} value={seasonUse.seasonId} onChange={(e) => setSeasonUse({ ...seasonUse, seasonId: e.target.value })}>{seasons.filter((season) => season.Nombre_Temporada !== "Todo el año").map((season) => <option key={season.Id_Temporada} value={season.Id_Temporada}>{season.Nombre_Temporada}</option>)}</select></FormField>
                  <FormField label="Insumo de tienda"><select className={controlClass} style={controlStyle} value={seasonUse.productId} onChange={(e) => setSeasonUse({ ...seasonUse, productId: e.target.value })}>{inventory.map((item) => <option key={item.Id_Producto} value={item.Id_Producto}>{item.Nombre_Producto} ({item.Stock})</option>)}</select></FormField>
                  <FormField label="Cantidad usada"><input required type="number" min=".01" step=".01" className={controlClass} style={controlStyle} value={seasonUse.qty} onChange={(e) => setSeasonUse({ ...seasonUse, qty: e.target.value })} /></FormField>
                  <div className="flex items-end"><AdminButton type="submit">Registrar insumo</AdminButton></div>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead style={{ background: "var(--color-secondary)" }}>
                      <tr>
                        {[
                          "Id_Temporada (PK)",
                          "Nombre_Temporada",
                          "Costo_Insumos",
                          "Ventas_Temporada",
                          "Ganancia_Neta",
                        ].map((h) => (
                          <th key={h} className="px-4 py-3 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {seasons.map((row) => (
                        <tr
                          key={row.Id_Temporada}
                          className="border-t"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <td className="px-4 py-3 font-bold">
                            {row.Id_Temporada}
                          </td>
                          <td className="px-4 py-3">{row.Nombre_Temporada}</td>
                          <td className="px-4 py-3">
                            {fmt(row.Costo_Insumos)}
                          </td>
                          <td className="px-4 py-3">
                            {fmt(row.Ventas_Temporada)}
                          </td>
                          <td
                            className="px-4 py-3 font-bold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {fmt(row.Ganancia_Neta)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
