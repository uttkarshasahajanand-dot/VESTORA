
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("vestora_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("vestora_cart", JSON.stringify(cart));
  }, [cart]);

  // ADD PRODUCT WITH SELECTED VARIANT
  const addToCart = (product, selectedVariant) => {
    if (!selectedVariant?.variant_id) {
      alert("Please select a size and colour.");
      return;
    }

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) =>
          item.product_id === product.product_id &&
          item.variant_id === selectedVariant.variant_id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.product_id === product.product_id &&
          item.variant_id === selectedVariant.variant_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          variant_id: selectedVariant.variant_id,
          size: selectedVariant.size,
          color: selectedVariant.color,
          quantity: 1
        }
      ];
    });
  };

  // REMOVE PRODUCT VARIANT
  const removeFromCart = (productId, variantId) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          !(
            item.product_id === productId &&
            item.variant_id === variantId
          )
      )
    );
  };

  // UPDATE PRODUCT VARIANT QUANTITY
  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity < 1) return;

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.product_id === productId &&
        item.variant_id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
