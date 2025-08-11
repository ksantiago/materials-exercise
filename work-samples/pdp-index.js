/**
 * Product Display Page (PDP) – Thinx.com
 *
 * Purpose:
 * Renders a complete product page in a headless Shopify + Next.js architecture,
 * merging Shopify Storefront API data (commerce), Contentful CMS modules (marketing),
 * and brand-specific constants into a performant, SEO-friendly experience.
 *
 * Key Responsibilities:
 * - Fetch & normalize data via getStaticPaths / getStaticProps:
 *   - Shopify product data, variants, and collections
 *   - Contentful modules (hero video, promo cards, FAQs, quote, gallery)
 *   - Brand constants (e.g., trialBubbleData)
 * - Compose PDP sections (gallery, details, marketing modules, reviews, FAQs, suggestions)
 *   with conditional rendering based on product tags, availability, and brand rules.
 * - Integrate tracking & analytics (pdpView pixel, product suggestion impressions)
 *   while keeping UI components pure and testable.
 *
 * Architectural Notes:
 * - Separate Layout Components:
 *   Uses SiteLayout, HeaderLayout, and FooterLayout so headers/navs vary correctly
 *   between brands, blog, and informational pages.
 * - Modular Data Mappers:
 *   Each Contentful module passes through a mapper to isolate schema changes
 *   from UI logic, ensuring marketers can update content without developer intervention.
 * - Performance & UX:
 *   Uses Suspense for async sections (reviews, suggestions) to isolate slow network calls.
 *   Static generation (`fallback: false`) chosen for SEO stability and predictable builds.
 */

import { fetchSpaceProperties } from "utils/client/shop/index";
import React, { Suspense, useEffect } from "react";
import { PdpProvider } from "context/PdpContext";
import styled from "styled-components";
import { above, spacing } from "utils";
import {
  getAllDayEquivalentHandle,
  getPromoCardData,
  handleScrolltoReviews,
  isReviewsHidden,
  isTFAProduct,
} from "utils/pdp";
import { getStore } from "components/sections/ReviewsQATabs/ReviewsQATabs.store";
import { thinxBrandName } from "constants/index";
import CtaLinkButton from "components/elements/Links/CallToActionLinkButton";
import { thinxBrand } from "constants/colors";
import SiteLayout from "components/layouts/SiteLayout/Default";
import HeaderLayout from "components/layouts/SiteLayout/Default/HeaderLayout";
import FooterLayout from "components/layouts/SiteLayout/Default/FooterLayout";
import seoMapper from "utils/contentMappers/seoMapper";
import { fetchBanner, fetchPDP } from "utils/client/page";
import { fetchCollectionsWithProducts, fetchProduct } from "utils/client/shop";
import { addView } from "components/sections/ProductSuggestions/utils";
import { trackPdpView } from "utils/tracking-pixels/trackPdpView";
import { getGIdfromBase64, getProductUrl } from "utils/utils";
import PdpMetatags from "components/blocks/PdpMetatags";
import { getAbsoluteUrl, pageKeys } from "utils/page.service";
import useBreakpoint from "hooks/useBreakpoint";
import {
  THINX_PAGE_HANDLE,
  THINX_SECTION_HANDLE,
  rotatingBannerMapper,
} from "components/blocks/RotatingBanner";

// COMPONENTS
import { H2, P } from "components/elements/Type";
import PDP, { galleryMapper, productDetailMapper } from "components/blocks/PDP";
import Quote, { quoteMapper } from "components/blocks/Quote";
import { thinxPromoCardMapper } from "components/blocks/PromoCard/contentMappers/promoCardMapper";
import ReviewsQATabs from "components/sections/ReviewsQATabs";
import FAQs, { faqsMapper } from "components/sections/FAQs";
import reviewsClient from "utils/client/reviews";
import ProductSuggestions from "components/sections/ProductSuggestions";
import Breadcrumbs from "components/blocks/Breadcrumbs";
import { HideFor } from "components/elements/Display";
import PDPSocialShare from "components/blocks/PDP/SocialShare";
import VideoWithTitle, {
  videoWithTitleMapper,
} from "components/sections/VideoWithTitle";
import SpacingWrapper from "components/elements/SpacingWrapper";
import { Grid } from "styled-css-grid";
import Cell from "components/elements/Grid/Cell";
import PromoCard from "components/blocks/PromoCard";
import { CTAButtonStyles } from "components/elements/Buttons/CallToAction";
import DynamicBanner from "components/blocks/DynamicBanner";
import { isAllDayProduct, isAllNightProduct } from "utils/product";

// DATA
import thinxSinglePDPData from "components/data/pages/thinxSinglePDPData";

import { THINX_COLLECTIONS } from "utils/client/shop/collectionHandles";
import { getProductStaticPaths } from "utils/client/shop/staticPaths";
import useReviewsSummary from "hooks/useReviewsSummary";
import { getImage } from "utils/vimeo";
import getVimeoImageUrl from "utils/client/vimeo";

const reviewsClientWrapper = () => ({
  fetchReviewsForProduct: async (query) => {
    const thinxReviews = reviewsClient(thinxBrandName);
    return thinxReviews.getReviews(query);
  },
});

// ----------- Styled wrappers & layout tokens -----------
// SpacingWrapper + `above` breakpoints drive consistent, responsive spacing.
// Keep layout concerns here to keep render logic below clean.
const PageWrapper = styled(SpacingWrapper).attrs({
  margin: { mobile: { top: spacing[24] }, tablet: { top: spacing[32] } },
})`
  position: relative;
`;

const QuoteWrapper = styled(SpacingWrapper).attrs({
  margin: {
    mobile: { bottom: spacing[64] },
    desktop: { bottom: spacing.override(116) },
  },
})`
  width: 100%;
`;

const VideoWrapper = styled(SpacingWrapper).attrs({
  margin: {
    mobile: { left: spacing[16], right: spacing[16], bottom: spacing[64] },
    tablet: { left: spacing[32], right: spacing[32] },
    desktop: { bottom: spacing.override(116) },
  },
})`
  ${above.tablet`
    margin-bottom: ${spacing.override(89)};
  `}

  ${above.desktop`
    max-width: 62.7rem;
    margin-left: auto;
    margin-right: auto;
  `}
`;

const ReviewsQAWrapper = styled(SpacingWrapper).attrs({
  margin: {
    mobile: { left: spacing[16], right: spacing[16], bottom: spacing[64] },
    tablet: { left: spacing[32], right: spacing[32] },
    desktop: { left: "auto", right: "auto" },
  },
  padding: {
    tablet: { top: spacing.override(88) },
  },
})`
  ${above.desktop`
    max-width: 96rem;
  `}
  ${above.desktopMax`
    max-width: 113rem;
  `}
`;

const FAQWrapper = styled(SpacingWrapper).attrs({
  padding: {
    left: spacing[16],
    right: spacing[16],
    top: spacing[48],
    bottom: spacing[48],
  },
})`
  background: ${thinxBrand.darkBeige};
`;

const StyledFAQs = styled(FAQs)`
  margin: 0 auto;
  background: transparent;

  ${above.desktop`
    max-width: 96rem;
  `};
`;

const SectionWrapper = styled(SpacingWrapper).attrs({
  margin: {
    mobile: { top: spacing.override(80), bottom: spacing.override(96) },
    tablet: { bottom: spacing.override(104) },
    desktop: { left: "auto", right: "auto" },
  },
  padding: {
    mobile: { left: spacing[16], right: spacing[16] },
    tablet: { left: spacing.override(30), right: spacing.override(30) },
  },
})`
  ${above.desktopMax`
    width: 144rem;
  `}
`;

const SectionTitle = styled(H2)`
  margin-bottom: ${({ $isColorBlock }) =>
    $isColorBlock ? `${spacing[20]}` : `${spacing[32]}`};

  ${above.tablet`
    margin-bottom: ${({ $isColorBlock }) => !$isColorBlock && `${spacing[40]}`};
  `}

  text-align: ${({ $isColorBlock }) => {
    if ($isColorBlock) return "left;";
  }}
`;

// ----------- ProductDetail (main PDP component) -----------
// Receives all normalized data from getStaticProps and composes the page:
// gallery/details -> marketing modules -> reviews -> FAQs -> suggestions.
// Marketing modules come from Contentful via mappers, so marketers can update content w/o deploys.
// The trial bubble is a reassurance element (“45-day trial + free returns”) passed as a constant and rendered with the gallery.
const ProductDetail = ({ data }) => {

// Data:
// - product, productId - Shopify
// - quoteData, heroVideoData, promoCardsData, faqsData - Contentful (CMS modules)
// - trialBubbleData - brand constant (messaging); includes isTFA flag
  const {
    product,
    productId,
    quoteData,
    heroVideoData,
    promoCardsData: [firstPromoCard, secondPromoCard],
    faqsData,
    trialBubbleData,
  } = data;

  const productReviewSummary = useReviewsSummary(productId, product.handle);

  firstPromoCard.image.width = "18rem";
  secondPromoCard.image.width = "18rem";

  const store = getStore({
    brand: thinxBrandName,
    client: reviewsClientWrapper(),
    product: {
      productId,
      productTitle: product.title,
      productHandle: product.handle,
    },
  });
  const thinxReviews = reviewsClient(thinxBrandName);

  const socialShareRef = React.createRef();

  // Tracking & view attribution:
  // - addView: logs impression for product suggestions (“customers also viewed” logic).
  // - trackPdpView: fires PDP view pixel for analytics/marketing attribution.
  // Keeping these in effects keeps components pure and avoids duplicate fires on re-renders.
  useEffect(() => {
    addView("thinx", product.handle);
  }, [product.handle]);

  useEffect(() => {
    trackPdpView({
      brand: "thinx",
      product,
    });
  }, [product]);

  // Gate reviews when tag policy or low volume applies.
  // Prevents rendering cost and layout issues when there’s not enough data available
  const hideReviews = isReviewsHidden(
    product.tags,
    productReviewSummary.totalReviews
  );

  const newData = {
    ...data,
    ratingReviews: {
      averageRating: productReviewSummary.averageRating,
      productReviewsTotal: productReviewSummary.totalReviews,
    },
  };

  const { isDesktopUp } = useBreakpoint();

  return (
    <>
      <SpacingWrapper
        padding={{
          mobile: {
            left: spacing[16],
            right: spacing[16],
          },
          desktop: {
            left: spacing[32],
            right: spacing[32],
          },
        }}
      >
        <Breadcrumbs />
      </SpacingWrapper>

      <PageWrapper id="thinx-pdp-page">
        <PDPSocialShare product={data.product} top={100} ref={socialShareRef} />
        <div ref={socialShareRef}>
          <PdpProvider data={newData} brand={thinxBrandName}>
            <PDP
              handleScroll={handleScrolltoReviews({ offset: -100 })}
              trialBubbleData={trialBubbleData}
            />
            <PdpMetatags />
          </PdpProvider>
        </div>
        {quoteData?.quotation ? (
          <HideFor below="tablet">
            <QuoteWrapper>
              <Quote
                quotation={quoteData.quotation}
                source={quoteData.source}
                bgColor={thinxBrand.lightBeige}
                showDot
              />
            </QuoteWrapper>
          </HideFor>
        ) : (
          <></>
        )}
        <VideoWrapper>
          <VideoWithTitle {...heroVideoData} />
        </VideoWrapper>

        <SectionWrapper>
          <Grid
            columns={2}
            rowGap={spacing[24]}
            columnGap={isDesktopUp ? spacing.override(30) : spacing[24]}
          >
            <Cell mobile={{ width: 2 }} tablet={{ width: 1 }}>
              <PromoCard {...firstPromoCard}>
                <CtaLinkButton
                  buttonStyle={CTAButtonStyles.Primary}
                  href={firstPromoCard.cta.href}
                >
                  <P>{firstPromoCard.cta.text}</P>
                </CtaLinkButton>
              </PromoCard>
            </Cell>

            <Cell mobile={{ width: 2 }} tablet={{ width: 1 }}>
              <PromoCard {...secondPromoCard}>
                <CtaLinkButton
                  buttonStyle={CTAButtonStyles.Primary}
                  href={secondPromoCard.cta.href}
                >
                  <P>{secondPromoCard.cta.text}</P>
                </CtaLinkButton>
              </PromoCard>
            </Cell>
          </Grid>
        </SectionWrapper>

        <Suspense fallback={<div>Loading...</div>}>
          {hideReviews ? (
            <SpacingWrapper padding={spacing[20]} />
          ) : (
            <ReviewsQAWrapper>
              {/* Reviews & Q/A section:
                 - `store` abstracts the reviews client so vendor swaps don’t leak into UI.
                 - voteActions wrap the client to keep the component stateless and testable.
                 - Suspense isolates slow networks from affecting the rest of the page. */}
              <div data-section="reviews-qa-section">
                <ReviewsQATabs
                  store={store}
                  faqItems={faqsData.faqs}
                  voteActions={{
                    voteUp: async (reviewId) => {
                      await thinxReviews.voteUp(reviewId);
                    },
                    voteDown: async (reviewId) => {
                      await thinxReviews.voteDown(reviewId);
                    },
                    voteUpUndo: async (reviewId) => {
                      await thinxReviews.voteUpUndo(reviewId);
                    },
                    voteDownUndo: async (reviewId) => {
                      await thinxReviews.voteDownUndo(reviewId);
                    },
                  }}
                  productSummary={productReviewSummary}
                />
              </div>
            </ReviewsQAWrapper>
          )}
        </Suspense>
        <FAQWrapper>
          <StyledFAQs
            brand={thinxBrandName}
            title={faqsData.sectionTitle}
            backgroundColor="primary"
            items={faqsData.faqs}
            twoColumnBreakpoint="tablet"
            linkColor={thinxBrand.highlighter}
            additionalFaqs={faqsData.additionalFaqs}
          >
            <SectionTitle $isColorBlock>FAQs</SectionTitle>
          </StyledFAQs>
        </FAQWrapper>
        <SectionWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <ProductSuggestions
              currentProduct={product}
              cta={{ text: "shop all styles" }}
            />
          </Suspense>
        </SectionWrapper>
      </PageWrapper>
    </>
  );
};

ProductDetail.getLayout = (page) => (
  <SiteLayout
    head={() => (
      <>
        <meta name="keywords" content="" />

        <script
          src="https://js.afterpay.com/afterpay-1.x.js"
          data-analytics-enabled
          async
        />
        <link
          rel="canonical"
          href={getAbsoluteUrl({
            pathname: pageKeys.THINX_PRODUCTS,
            payload: {
              product: getAllDayEquivalentHandle(
                page.props.productHandle,
                thinxBrandName
              ),
            },
          })}
        />
      </>
    )}
  >
    <HeaderLayout banner={<DynamicBanner slides={page.props.banner.slides} />}>
      <FooterLayout>
        <main>{page}</main>
      </FooterLayout>
    </HeaderLayout>
  </SiteLayout>
);

// ----------- Static paths -----------
// Collection handles come from Thinx “space properties”.
// We read keys like "Thinx:Collections" and "Thinx:Collections-Leakproof" to get the active collection handles,
// then fetch those collections and build product paths for each locale.
// `fallback: false` means new products 404 until the next build — chosen to keep SEO/canonicals stable.
export const getStaticPaths = async ({ locales }) => {
  const keys = ["Thinx:Collections", "Thinx:Collections-Leakproof"];
  const spaces = await fetchSpaceProperties(keys);

  const collectionHandles = spaces
    .map((space) =>
      space.items
        .find((o) => o.key === "handles")
        .value.split(",")
        .map((x) => x.trim())
    )
    .flatMap((x) => x);
  collectionHandles.push("thinx-last-call-sale");

  const collections = await fetchCollectionsWithProducts(collectionHandles, {
    legacy: true,
  });

  const paths = getProductStaticPaths(collections, locales);

  return {
    paths,
    fallback: false,
  };
};

export async function getStaticProps({
  params: { productHandle, collectionHandle },
  locale,
  preview = false,
}) {
  const productHandleWithBrand = `${thinxBrandName}-${productHandle}`;

  // Fetch core product data from Shopify Storefront API
  const product = await fetchProduct(productHandleWithBrand, {
    legacy: true,
  });

  product.productUrl = getProductUrl({
    brand: thinxBrandName,
    collectionSeoHandle: collectionHandle,
    productSeoHandle: productHandle,
  });

  let MARKETING_SECTION_HANDLE;

  // Choose the Contentful marketing section by product family:
  // “All Day / All Night” vs TFA vs default. Keeps copy/media targeted without branching UI code.
  if (
    isAllDayProduct(product.productType) ||
    isAllNightProduct(product.productType)
  ) {
    MARKETING_SECTION_HANDLE = "thinx-pdp-all-day-global-marketing-content";
  } else if (isTFAProduct(product.tags)) {
    MARKETING_SECTION_HANDLE = "thinx-tfa-pdp-global-marketing-content";
  } else {
    MARKETING_SECTION_HANDLE = "thinx-pdp-global-marketing-content";
  }

  // Trial bubble copy (reassurance message) comes from a shared constant and is specialized per brand and product type.
  // We also surface `isTFA` so downstream blocks can tweak UI if needed.
  const trialBubbleTempData = isTFAProduct(product.tags)
    ? thinxSinglePDPData.trialBubbleData.tfa
    : thinxSinglePDPData.trialBubbleData.thinx;

  const trialBubbleData = {
    ...trialBubbleTempData,
    isTFA: isTFAProduct(product.tags),
  };

  let quoteData = null;
  let promoCardsData = null;
  let gallery = null;
  let faqsData = null;
  let productDetail = null;

  // Fetch Contentful modules for this PDP (copy, promo cards, video, gallery, FAQs, banner).
  // These are normalized via mappers so schema changes stay contained to mapping code.
  const pdpData = await fetchPDP(productHandleWithBrand, { locale, preview });

  try {
    quoteData = quoteMapper(pdpData, `${productHandleWithBrand}-quote`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Warning:", e.message);
  }

  // Normalize Contentful modules into props the PDP can consume
  const { title, embedUrl } = videoWithTitleMapper(
    pdpData,
    MARKETING_SECTION_HANDLE
  );
  const vimeoData = await getVimeoImageUrl(embedUrl);
  const poster = getImage(vimeoData, 627, 352);
  promoCardsData = thinxPromoCardMapper(pdpData);
  gallery = galleryMapper(pdpData);
  productDetail = productDetailMapper(pdpData);
  faqsData = faqsMapper(pdpData);

  const productDetailPromoCard = getPromoCardData(
    product.tags,
    product.productType
  );

  const productId = getGIdfromBase64(product.id);

  
  const seo = seoMapper(pdpData);

  const bannerPage = await fetchBanner(THINX_PAGE_HANDLE, {
    locale,
  });

  // Combine data into one object passed to the page
  const data = {
    product,
    quoteData,
    ratingReviews: null,
    carousel: gallery,
    heroVideoData: { title, videoUrl: embedUrl, poster },
    promoCardsData,
    faqsData,
    productDetail,
    productId,
    trialBubbleData,
    seo,
    productDetailPromoCard,
  };

  return {
    props: {
      data,
      ...seo,
      productHandle,
      banner: rotatingBannerMapper(bannerPage, THINX_SECTION_HANDLE),
    },
  };
}

export default ProductDetail;
