import { FC } from 'react';
import { CANVAS_DRAFT_STATE, CANVAS_PUBLISHED_STATE } from '@uniformdev/canvas';
import { withUniformGetServerSideProps } from '@uniformdev/canvas-next/route';
import { getBreadcrumbs, getRouteClient } from '@/utilities/canvas/canvasClients';
import { Page } from '@/components';
import { PageProps } from '@/components/Page';
import ProductDetailsPage from '@/components/ProductDetailsPage';

const PRODUCT_DETAILS_PAGE_TYPE = 'productDetailsPage';

export const getServerSideProps = withUniformGetServerSideProps({
  requestOptions: context => ({
    state: Boolean(context.preview) ? CANVAS_DRAFT_STATE : CANVAS_PUBLISHED_STATE,
  }),
  client: getRouteClient(),
  handleComposition: async (routeResponse, _context) => {
    const { composition, errors } = routeResponse.compositionApiResponse || {};

    if (errors?.some(e => e.type === 'data' || e.type === 'binding')) {
      return { notFound: true };
    }

    const preview = Boolean(_context.preview);
    const breadcrumbs = await getBreadcrumbs({
      compositionId: composition._id,
      preview,
      dynamicTitle: composition?.parameters?.pageTitle?.value as string,
      resolvedUrl: _context.resolvedUrl,
    });

    return {
      props: { preview, data: composition || null, context: { breadcrumbs } },
    };
  },
});

const PageResolver: FC<PageProps> = props =>
  props.data.type === PRODUCT_DETAILS_PAGE_TYPE ? <ProductDetailsPage {...props} /> : <Page {...props} />;

export default PageResolver;
