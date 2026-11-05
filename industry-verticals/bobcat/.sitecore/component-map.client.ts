// Client-safe component map for App Router
import { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';


import { BYOCClientWrapper, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in import section
import * as ThemeSwitcher from 'src/components/utilities/ThemeSwitcher';
import * as SiteTheme from 'src/components/utilities/SiteTheme';
import * as LoanCalculator from 'src/components/utilities/LoanCalculator';
import * as LanguageSwitcher from 'src/components/utilities/LanguageSwitcher';
import * as ContactForm from 'src/components/utilities/ContactForm';
import * as ApplicationForm from 'src/components/utilities/ApplicationForm';
import * as SearchResults from 'src/components/search/SearchResults';
import * as PreviewSearch from 'src/components/search/PreviewSearch';
import * as MoreLikeThis from 'src/components/search/MoreLikeThis';
import * as PortalWelcome from 'src/components/portal/PortalWelcome';
import * as PortalResources from 'src/components/portal/PortalResources';
import * as PortalMachines from 'src/components/portal/PortalMachines';
import * as PortalLogin from 'src/components/portal/PortalLogin';
import * as PortalHeader from 'src/components/portal/PortalHeader';
import * as PortalFooter from 'src/components/portal/PortalFooter';
import * as PortalDealer from 'src/components/portal/PortalDealer';
import * as PortalConsideredMachine from 'src/components/portal/PortalConsideredMachine';
import * as PortalAttachments from 'src/components/portal/PortalAttachments';
import * as ColumnSplitter from 'src/components/pagestructure/ColumnSplitter';
import * as VideoFeature from 'src/components/pagecontent/VideoFeature';
import * as TwoColumnCta from 'src/components/pagecontent/TwoColumnCta';
import * as ThreeColumnCta from 'src/components/pagecontent/ThreeColumnCta';
import * as Testimonials from 'src/components/pagecontent/Testimonials';
import * as StatsCounter from 'src/components/pagecontent/StatsCounter';
import * as RichText from 'src/components/pagecontent/RichText';
import * as Quote from 'src/components/pagecontent/Quote';
import * as Questions from 'src/components/pagecontent/Questions';
import * as PromoCta from 'src/components/pagecontent/PromoCta';
import * as ProjectList from 'src/components/pagecontent/ProjectList';
import * as ProjectDetails from 'src/components/pagecontent/ProjectDetails';
import * as ProductHero from 'src/components/pagecontent/ProductHero';
import * as ProductDetails from 'src/components/pagecontent/ProductDetails';
import * as ProductCards from 'src/components/pagecontent/ProductCards';
import * as ParallaxBanner from 'src/components/pagecontent/ParallaxBanner';
import * as PageBackground from 'src/components/pagecontent/PageBackground';
import * as ModelListing from 'src/components/pagecontent/ModelListing';
import * as LinkColumns from 'src/components/pagecontent/LinkColumns';
import * as LeadForm from 'src/components/pagecontent/LeadForm';
import * as InventorySearch from 'src/components/pagecontent/InventorySearch';
import * as InPageNav from 'src/components/pagecontent/InPageNav';
import * as ImageGallery from 'src/components/pagecontent/ImageGallery';
import * as IconLinkTiles from 'src/components/pagecontent/IconLinkTiles';
import * as HeroBanner from 'src/components/pagecontent/HeroBanner';
import * as Hero from 'src/components/pagecontent/Hero';
import * as HeadingCta from 'src/components/pagecontent/HeadingCta';
import * as FourColumnCta from 'src/components/pagecontent/FourColumnCta';
import * as FiveColumnCta from 'src/components/pagecontent/FiveColumnCta';
import * as Features from 'src/components/pagecontent/Features';
import * as DocumentsList from 'src/components/pagecontent/DocumentsList';
import * as DealerLocator from 'src/components/pagecontent/DealerLocator';
import * as CtaBanner from 'src/components/pagecontent/CtaBanner';
import * as Comparison from 'src/components/pagecontent/Comparison';
import * as Carousel from 'src/components/pagecontent/Carousel';
import * as AuthorWidget from 'src/components/pagecontent/AuthorWidget';
import * as AuthorList from 'src/components/pagecontent/AuthorList';
import * as AuthorDetails from 'src/components/pagecontent/AuthorDetails';
import * as ArticleListing from 'src/components/pagecontent/ArticleListing';
import * as ArticleList from 'src/components/pagecontent/ArticleList';
import * as ArticleHeader from 'src/components/pagecontent/ArticleHeader';
import * as ArticleDetails from 'src/components/pagecontent/ArticleDetails';
import * as ArticleBody from 'src/components/pagecontent/ArticleBody';
import * as AppPromo from 'src/components/pagecontent/AppPromo';
import * as AccordionSection from 'src/components/pagecontent/AccordionSection';
import * as Accordion from 'src/components/pagecontent/Accordion';
import * as ProfileWidget from 'src/components/non-sitecore/ProfileWidget';
import * as ProfileIdWidget from 'src/components/non-sitecore/ProfileIdWidget';
import * as ParallaxBackgroundImage from 'src/components/non-sitecore/ParallaxBackgroundImage';
import * as IconAccent from 'src/components/non-sitecore/IconAccent';
import * as DottedAccent from 'src/components/non-sitecore/DottedAccent';
import * as CountUp from 'src/components/non-sitecore/CountUp';
import * as Navigation from 'src/components/navigation/Navigation';
import * as Header from 'src/components/navigation/Header';
import * as Footer from 'src/components/navigation/Footer';
import * as Eyebrow from 'src/components/navigation/Eyebrow';
import * as Breadcrumb from 'src/components/navigation/Breadcrumb';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['ThemeSwitcher', { ...ThemeSwitcher }],
  ['SiteTheme', { ...SiteTheme }],
  ['LoanCalculator', { ...LoanCalculator }],
  ['LanguageSwitcher', { ...LanguageSwitcher }],
  ['ContactForm', { ...ContactForm }],
  ['ApplicationForm', { ...ApplicationForm }],
  ['SearchResults', { ...SearchResults }],
  ['PreviewSearch', { ...PreviewSearch }],
  ['MoreLikeThis', { ...MoreLikeThis }],
  ['PortalWelcome', { ...PortalWelcome }],
  ['PortalResources', { ...PortalResources }],
  ['PortalMachines', { ...PortalMachines }],
  ['PortalLogin', { ...PortalLogin }],
  ['PortalHeader', { ...PortalHeader }],
  ['PortalFooter', { ...PortalFooter }],
  ['PortalDealer', { ...PortalDealer }],
  ['PortalConsideredMachine', { ...PortalConsideredMachine }],
  ['PortalAttachments', { ...PortalAttachments }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['VideoFeature', { ...VideoFeature }],
  ['TwoColumnCta', { ...TwoColumnCta }],
  ['ThreeColumnCta', { ...ThreeColumnCta }],
  ['Testimonials', { ...Testimonials }],
  ['StatsCounter', { ...StatsCounter }],
  ['RichText', { ...RichText }],
  ['Quote', { ...Quote }],
  ['Questions', { ...Questions }],
  ['PromoCta', { ...PromoCta }],
  ['ProjectList', { ...ProjectList }],
  ['ProjectDetails', { ...ProjectDetails }],
  ['ProductHero', { ...ProductHero }],
  ['ProductDetails', { ...ProductDetails }],
  ['ProductCards', { ...ProductCards }],
  ['ParallaxBanner', { ...ParallaxBanner }],
  ['PageBackground', { ...PageBackground }],
  ['ModelListing', { ...ModelListing }],
  ['LinkColumns', { ...LinkColumns }],
  ['LeadForm', { ...LeadForm }],
  ['InventorySearch', { ...InventorySearch }],
  ['InPageNav', { ...InPageNav }],
  ['ImageGallery', { ...ImageGallery }],
  ['IconLinkTiles', { ...IconLinkTiles }],
  ['HeroBanner', { ...HeroBanner }],
  ['Hero', { ...Hero }],
  ['HeadingCta', { ...HeadingCta }],
  ['FourColumnCta', { ...FourColumnCta }],
  ['FiveColumnCta', { ...FiveColumnCta }],
  ['Features', { ...Features }],
  ['DocumentsList', { ...DocumentsList }],
  ['DealerLocator', { ...DealerLocator }],
  ['CtaBanner', { ...CtaBanner }],
  ['Comparison', { ...Comparison }],
  ['Carousel', { ...Carousel }],
  ['AuthorWidget', { ...AuthorWidget }],
  ['AuthorList', { ...AuthorList }],
  ['AuthorDetails', { ...AuthorDetails }],
  ['ArticleListing', { ...ArticleListing }],
  ['ArticleList', { ...ArticleList }],
  ['ArticleHeader', { ...ArticleHeader }],
  ['ArticleDetails', { ...ArticleDetails }],
  ['ArticleBody', { ...ArticleBody }],
  ['AppPromo', { ...AppPromo }],
  ['AccordionSection', { ...AccordionSection }],
  ['Accordion', { ...Accordion }],
  ['ProfileWidget', { ...ProfileWidget }],
  ['ProfileIdWidget', { ...ProfileIdWidget }],
  ['ParallaxBackgroundImage', { ...ParallaxBackgroundImage }],
  ['IconAccent', { ...IconAccent }],
  ['DottedAccent', { ...DottedAccent }],
  ['CountUp', { ...CountUp }],
  ['Navigation', { ...Navigation }],
  ['Header', { ...Header }],
  ['Footer', { ...Footer }],
  ['Eyebrow', { ...Eyebrow }],
  ['Breadcrumb', { ...Breadcrumb }],
]);

export default componentMap;
