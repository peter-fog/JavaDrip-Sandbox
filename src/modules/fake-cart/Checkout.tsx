import { FC, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUniformContext } from '@uniformdev/context-react';
import Image from '../../components/Image';
import { CheckoutFormData, CheckoutStep, useFakeCartContext } from './FakeCartProvider';
import Button from '../../components/Button';
import Container from '../../components/Container';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import InformationContent from '../../components/InformationContent';
import ShoppingCartItem from '../../components/ShoppingCartItem';
import CheckoutItem from './CheckoutItem';
import CheckoutForm from './CheckoutForm';
import { PaddingSize } from '../../utilities/styling';

const Checkout: FC = () => {
  const router = useRouter();
  const { context } = useUniformContext();
  const {
    cart,
    cartAmount,
    shippingData,
    billingData,
    setBillingData,
    setShippingData,
    emptyFakeCart,
    currentStep,
    setCurrentStep,
  } = useFakeCartContext();

  useEffect(
    () => () => {
      setTimeout(emptyFakeCart);
    },
    [emptyFakeCart]
  );

  const hasShippingData = Object.values(shippingData).some(value => Boolean(value));

  const cartItems = useMemo(() => Object.values(cart).map(cartItem => cartItem), [cart]);

  const hasItems = Boolean(cartItems.length);

  const onCheckoutComplete = useCallback(() => {
    window.dispatchEvent(new CustomEvent('Order Completed', { detail: { cartItems } }));
    context.update({ quirks: { abandoned: 'false' } });
    router.push(`${router?.asPath}/success`);
    setCurrentStep(CheckoutStep.Finished, { force: true });
  }, [cartItems, context, router, setCurrentStep]);

  const onBillingInfoComplete = useCallback(
    (billingData: CheckoutFormData) => {
      setCurrentStep(CheckoutStep.ShippingInfo, { force: true });
      setBillingData(billingData, { force: true });
    },
    [setCurrentStep, setBillingData]
  );

  const onShippingInfoComplete = useCallback(
    (shippingData: CheckoutFormData) => {
      setCurrentStep(CheckoutStep.ReadyToFinish, { force: true });
      setShippingData(shippingData, { force: true });
    },
    [setCurrentStep, setShippingData]
  );

  if (!hasItems) {
    return (
      <InformationContent
        title="There's nothing to check out with"
        text="Please add some products and try again"
        className="mb-10"
        imageComponent={
          <Image
            src="https://res.cloudinary.com/uniform-demos/image/upload/v1692282886/csk-icons/icon-cart_zzou3e_yovtho.svg"
            width={75}
            height={75}
            alt="cart icon"
            unoptimized
          />
        }
      />
    );
  }

  return (
    <>
      <Container paddingTop={PaddingSize.None}>
        <div className="lg:mb-28 text-secondary-content">
          <CheckoutItem title="Your products">
            <div className="p-4 h-full">
              <div className="md:flex flex-row font-bold border-b pb-4 hidden">
                <div className="basis-3/5">ITEM</div>
                <div className="basis-1/5">QTY</div>
                <div className="basis-1/5 text-right">Price</div>
              </div>
              <div className="h-full">
                {cartItems.map(cartItem => (
                  <ShoppingCartItem key={cartItem.product.id} quantity={cartItem.quantity} product={cartItem.product} />
                ))}
              </div>
            </div>
          </CheckoutItem>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckoutItem state={currentStep === CheckoutStep.BillingInfo} title="Billing Info">
              <div className="p-4">
                <CheckoutForm onSubmit={onBillingInfoComplete} initialValues={billingData} />
              </div>
            </CheckoutItem>
            <CheckoutItem state={currentStep === CheckoutStep.ShippingInfo} title="Shipping Info">
              <div className="p-4">
                <CheckoutForm
                  onSubmit={onShippingInfoComplete}
                  initialValues={hasShippingData ? shippingData : billingData}
                />
              </div>
            </CheckoutItem>
          </div>
          {(currentStep === CheckoutStep.ReadyToFinish || currentStep === CheckoutStep.Finished) && (
            <div className="pt-9">
              <div className="flex flex-col items-end">
                <div>
                  <div className="flex flex-row justify-between font-bold text-2xl">
                    <span className="pr-4">Subtotal:</span>
                    <CurrencyFormatter amount={cartAmount} />
                  </div>
                  <div className="flex flex-row justify-between font-bold text-2xl">
                    <span className="pr-4">Delivery:</span>
                    Free
                  </div>
                  <div className="flex flex-row justify-between font-bold text-2xl">
                    <span className="pr-4">Total:</span>
                    <CurrencyFormatter amount={cartAmount} />
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-end mt-3">
                <Button copy="Pay" style="primary" onClick={onCheckoutComplete} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default Checkout;
