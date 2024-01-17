export interface ShoppingCartItemProps {
  product: CommerceTypes.Product;
  quantity: number;
  isInModal?: boolean;
  updateItemQuantity?: (productId: string, newQuantity: number) => void;
  removeItemFromCart?: (productId: string) => void;
}

export * from './ShoppingCartItem';
export { default } from './ShoppingCartItem';
