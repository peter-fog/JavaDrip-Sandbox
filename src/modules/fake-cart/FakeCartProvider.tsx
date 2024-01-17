import { FC, ReactNode, createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUniformContext } from '@uniformdev/context-react';
import useStorage from '../../hooks/useStorage';
import normalizeProduct from './normalizeProduct';

const ShoppingCartModal = dynamic(() => import('./ShoppingCartModal').then(com => com), {
  ssr: false,
});

type FakeCart = Record<string, CommerceTypes.FakeCartItem>;

export const DEFAULT_FORM_VALUES: CheckoutFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

export enum CheckoutStep {
  BillingInfo = 'BillingInfo',
  ShippingInfo = 'ShippingInfo',
  ReadyToFinish = 'ReadyToFinish',
  Finished = 'Finished',
}

interface FakeCartContextProps {
  cart: FakeCart;
  cartAmount: number;
  currentStep: CheckoutStep;
  totalFakeCartItemsCount: number;
  isModalFakeCartOpen: boolean;
  billingData: CheckoutFormData;
  shippingData: CheckoutFormData;
  setCurrentStep: (step: CheckoutStep, options?: { force: boolean }) => void;
  setBillingData: (data: CheckoutFormData, options?: { force: boolean }) => void;
  setShippingData: (data: CheckoutFormData, options?: { force: boolean }) => void;
  setIsModalFakeCartOpen: (isOpen: boolean) => void;
  addItemToFakeCart: (item: CommerceTypes.FakeCartAddItem) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItemFromFakeCart: (productId: string) => void;
  emptyFakeCart: () => void;
}

export const FakeCartContext = createContext<FakeCartContextProps>({
  cart: {},
  cartAmount: 0,
  totalFakeCartItemsCount: 0,
  isModalFakeCartOpen: false,
  currentStep: CheckoutStep.BillingInfo,
  setCurrentStep: () => null,
  billingData: DEFAULT_FORM_VALUES,
  shippingData: DEFAULT_FORM_VALUES,
  setBillingData: () => null,
  setShippingData: () => null,
  setIsModalFakeCartOpen: () => null,
  addItemToFakeCart: () => null,
  updateItemQuantity: () => null,
  removeItemFromFakeCart: () => null,
  emptyFakeCart: () => null,
});

type Styles = {
  modal?: {
    container?: string;
  };
};

export type FakeCartContextProviderProps = {
  children: ReactNode;
  styles?: Styles;
};

export enum FakeCartDataStorageKey {
  UserCart = 'user-cart',
  CheckoutStep = 'checkout-step',
  BillingInfo = 'billing-info',
  ShippingInfo = 'shipping-info',
}

export type CheckoutFormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const FakeCartContextProvider: FC<FakeCartContextProviderProps> = ({ styles, children }) => {
  const [cart, setFakeCart] = useStorage<FakeCart>(FakeCartDataStorageKey.UserCart, {});
  const { context } = useUniformContext();

  const [currentStep, setCurrentStep] = useStorage<CheckoutStep>(
    FakeCartDataStorageKey.CheckoutStep,
    CheckoutStep.BillingInfo
  );

  const [billingData, setBillingData] = useStorage(FakeCartDataStorageKey.BillingInfo, DEFAULT_FORM_VALUES);

  const [shippingData, setShippingData] = useStorage(FakeCartDataStorageKey.ShippingInfo, DEFAULT_FORM_VALUES);
  const [isModalFakeCartOpen, setIsModalFakeCartOpen] = useState<boolean>(false);

  const addItemToFakeCart = useCallback(
    (item: CommerceTypes.FakeCartAddItem) => {
      //TODO: think how to improve normalize process
      const normalizedProduct = normalizeProduct(item.product);

      const cartItem = cart[normalizedProduct.id];

      if (cartItem) {
        setFakeCart({
          [normalizedProduct.id]: {
            ...cartItem,
            quantity: cartItem.quantity + item.quantity,
          },
        });
      } else {
        setFakeCart({
          [normalizedProduct.id]: {
            quantity: item.quantity,
            product: normalizedProduct,
          },
        });
      }

      setIsModalFakeCartOpen(true);
    },
    [cart, setFakeCart]
  );

  const removeItemFromFakeCart = useCallback(
    (productId: string) => {
      const updatedFakeCart = Object.entries(cart).reduce<FakeCart>((acc, [key, value]) => {
        if (key !== productId) acc[key] = value;
        return acc;
      }, {});
      if (!Object.keys(updatedFakeCart).length) setIsModalFakeCartOpen(false);
      setFakeCart(updatedFakeCart, { force: true });
    },
    [cart, setFakeCart]
  );

  const emptyFakeCart = useCallback(() => {
    if (currentStep === CheckoutStep.Finished) {
      setIsModalFakeCartOpen(false);
      setFakeCart({}, { force: true });
      setBillingData(DEFAULT_FORM_VALUES, { force: true });
      setShippingData(DEFAULT_FORM_VALUES, { force: true });
      setCurrentStep(CheckoutStep.BillingInfo, { force: true });
    }
  }, [setFakeCart, setBillingData, setShippingData, setCurrentStep, currentStep]);

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      const cartItem = cart[productId];
      if (!cartItem) return;
      setFakeCart({ [productId]: { ...cartItem, quantity } });
    },
    [cart, setFakeCart]
  );

  const totalFakeCartItemsCount = useMemo(
    () => Object.values(cart).reduce((acc, cartItem) => acc + cartItem.quantity, 0),
    [cart]
  );

  useEffect(() => {
    if (totalFakeCartItemsCount) {
      context.update({ quirks: { isCartEmpty: 'false' } });
    } else {
      context.update({ quirks: { isCartEmpty: 'true', abandoned: 'false' } });
    }
  }, [totalFakeCartItemsCount, context]);

  const cartAmount = useMemo(
    () =>
      Object.values(cart).reduce(
        (acc, cartItem) => acc + cartItem.quantity * ((cartItem.product.price as number) || 0),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      cartAmount,
      billingData,
      shippingData,
      setBillingData,
      setShippingData,
      currentStep,
      totalFakeCartItemsCount,
      setCurrentStep,
      isModalFakeCartOpen,
      setIsModalFakeCartOpen,
      addItemToFakeCart,
      updateItemQuantity,
      removeItemFromFakeCart,
      emptyFakeCart,
    }),
    [
      cart,
      cartAmount,
      billingData,
      shippingData,
      setBillingData,
      setShippingData,
      totalFakeCartItemsCount,
      isModalFakeCartOpen,
      setIsModalFakeCartOpen,
      addItemToFakeCart,
      updateItemQuantity,
      removeItemFromFakeCart,
      emptyFakeCart,
      setCurrentStep,
      currentStep,
    ]
  );

  return (
    <FakeCartContext.Provider value={value}>
      {children}
      <ShoppingCartModal styles={styles?.modal} />
    </FakeCartContext.Provider>
  );
};

export default FakeCartContextProvider;

export const useFakeCartContext = () => useContext(FakeCartContext);
