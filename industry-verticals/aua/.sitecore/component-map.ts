// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as SitecoreStyles from 'src/components/SitecoreStyles';
import * as RowSplitter from 'src/components/RowSplitter';
import * as RichText from 'src/components/RichText';
import * as Promo from 'src/components/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/PartialDesignDynamicPlaceholder';
import * as Navigation from 'src/components/Navigation';
import * as LinkList from 'src/components/LinkList';
import * as FEAASScripts from 'src/components/FEAASScripts';
import * as ContentBlock from 'src/components/ContentBlock';
import * as Container from 'src/components/Container';
import * as ColumnSplitter from 'src/components/ColumnSplitter';
import * as CdpPageView from 'src/components/CdpPageView';
import * as ThemeSwitcher from 'src/components/Utilities/ThemeSwitcher';
import * as LoanCalculator from 'src/components/Utilities/LoanCalculator';
import * as LanguageSwitcher from 'src/components/Utilities/LanguageSwitcher';
import * as ContactForm from 'src/components/Utilities/ContactForm';
import * as ApplicationForm from 'src/components/Utilities/ApplicationForm';
import * as tooltip from 'src/components/ui/tooltip';
import * as toggle from 'src/components/ui/toggle';
import * as togglegroup from 'src/components/ui/toggle-group';
import * as toaster from 'src/components/ui/toaster';
import * as toast from 'src/components/ui/toast';
import * as textarea from 'src/components/ui/textarea';
import * as tabs from 'src/components/ui/tabs';
import * as table from 'src/components/ui/table';
import * as sonner from 'src/components/ui/sonner';
import * as slider from 'src/components/ui/slider';
import * as skeleton from 'src/components/ui/skeleton';
import * as sidebar from 'src/components/ui/sidebar';
import * as sheet from 'src/components/ui/sheet';
import * as separator from 'src/components/ui/separator';
import * as select from 'src/components/ui/select';
import * as scrollarea from 'src/components/ui/scroll-area';
import * as resizable from 'src/components/ui/resizable';
import * as radiogroup from 'src/components/ui/radio-group';
import * as progress from 'src/components/ui/progress';
import * as popover from 'src/components/ui/popover';
import * as pagination from 'src/components/ui/pagination';
import * as navigationmenu from 'src/components/ui/navigation-menu';
import * as menubar from 'src/components/ui/menubar';
import * as label from 'src/components/ui/label';
import * as input from 'src/components/ui/input';
import * as inputotp from 'src/components/ui/input-otp';
import * as hovercard from 'src/components/ui/hover-card';
import * as form from 'src/components/ui/form';
import * as dropdownmenu from 'src/components/ui/dropdown-menu';
import * as drawer from 'src/components/ui/drawer';
import * as dialog from 'src/components/ui/dialog';
import * as contextmenu from 'src/components/ui/context-menu';
import * as command from 'src/components/ui/command';
import * as collapsible from 'src/components/ui/collapsible';
import * as checkbox from 'src/components/ui/checkbox';
import * as chart from 'src/components/ui/chart';
import * as carousel from 'src/components/ui/carousel';
import * as card from 'src/components/ui/card';
import * as calendar from 'src/components/ui/calendar';
import * as button from 'src/components/ui/button';
import * as breadcrumb from 'src/components/ui/breadcrumb';
import * as badge from 'src/components/ui/badge';
import * as avatar from 'src/components/ui/avatar';
import * as aspectratio from 'src/components/ui/aspect-ratio';
import * as animatedhovernav from 'src/components/ui/animated-hover-nav';
import * as alert from 'src/components/ui/alert';
import * as alertdialog from 'src/components/ui/alert-dialog';
import * as accordion from 'src/components/ui/accordion';
import * as SearchResults from 'src/components/search-results/SearchResults';
import * as SearchResultscopy from 'src/components/search-results/SearchResults copy';
import * as data from 'src/components/search-results/data';
import * as PreviewSearchIcon from 'src/components/Search/PreviewSearch/PreviewSearchIcon';
import * as PreviewSearch from 'src/components/Search/PreviewSearch/PreviewSearch';
import * as Spinner from 'src/components/Search/components/Spinner/Spinner';
import * as TwoColumnCta from 'src/components/PageContent/TwoColumnCta';
import * as ThreeColumnCta from 'src/components/PageContent/ThreeColumnCta';
import * as Testimonials from 'src/components/PageContent/Testimonials';
import * as StatsCounter from 'src/components/PageContent/StatsCounter';
import * as Quote from 'src/components/PageContent/Quote';
import * as Questions from 'src/components/PageContent/Questions';
import * as PromoCta from 'src/components/PageContent/PromoCta';
import * as ProjectList from 'src/components/PageContent/ProjectList';
import * as ProjectDetails from 'src/components/PageContent/ProjectDetails';
import * as ParallaxBanner from 'src/components/PageContent/ParallaxBanner';
import * as PageBackground from 'src/components/PageContent/PageBackground';
import * as ImageGallery from 'src/components/PageContent/ImageGallery';
import * as HeroBanner from 'src/components/PageContent/HeroBanner';
import * as Hero from 'src/components/PageContent/Hero';
import * as HeadingCta from 'src/components/PageContent/HeadingCta';
import * as FourColumnCta from 'src/components/PageContent/FourColumnCta';
import * as FiveColumnCta from 'src/components/PageContent/FiveColumnCta';
import * as Features from 'src/components/PageContent/Features';
import * as DocumentsList from 'src/components/PageContent/DocumentsList';
import * as CtaBanner from 'src/components/PageContent/CtaBanner';
import * as Comparison from 'src/components/PageContent/Comparison';
import * as Carousel from 'src/components/PageContent/Carousel';
import * as Card from 'src/components/PageContent/Card';
import * as AuthorWidget from 'src/components/PageContent/AuthorWidget';
import * as AuthorList from 'src/components/PageContent/AuthorList';
import * as AuthorDetails from 'src/components/PageContent/AuthorDetails';
import * as ArticleList from 'src/components/PageContent/ArticleList';
import * as ArticleDetails from 'src/components/PageContent/ArticleDetails';
import * as AppPromo from 'src/components/PageContent/AppPromo';
import * as Advert from 'src/components/PageContent/Advert';
import * as Accordion from 'src/components/PageContent/Accordion';
import * as ParallaxBackgroundImage from 'src/components/NonSitecore/ParallaxBackgroundImage';
import * as IconAccent from 'src/components/NonSitecore/IconAccent';
import * as DottedAccent from 'src/components/NonSitecore/DottedAccent';
import * as DemoUserSwitcher from 'src/components/NonSitecore/DemoUserSwitcher';
import * as CountUp from 'src/components/NonSitecore/CountUp';
import * as Header from 'src/components/Navigation/Header';
import * as Footer from 'src/components/Navigation/Footer';
import * as Eyebrow from 'src/components/Navigation/Eyebrow';
import * as Breadcrumb from 'src/components/Navigation/Breadcrumb';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['SitecoreStyles', { ...SitecoreStyles }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['Navigation', { ...Navigation }],
  ['LinkList', { ...LinkList }],
  ['FEAASScripts', { ...FEAASScripts }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['CdpPageView', { ...CdpPageView }],
  ['ThemeSwitcher', { ...ThemeSwitcher }],
  ['LoanCalculator', { ...LoanCalculator }],
  ['LanguageSwitcher', { ...LanguageSwitcher }],
  ['ContactForm', { ...ContactForm }],
  ['ApplicationForm', { ...ApplicationForm }],
  ['tooltip', { ...tooltip, componentType: 'client' }],
  ['toggle', { ...toggle, componentType: 'client' }],
  ['toggle-group', { ...togglegroup, componentType: 'client' }],
  ['toaster', { ...toaster }],
  ['toast', { ...toast }],
  ['textarea', { ...textarea }],
  ['tabs', { ...tabs }],
  ['table', { ...table }],
  ['sonner', { ...sonner, componentType: 'client' }],
  ['slider', { ...slider }],
  ['skeleton', { ...skeleton }],
  ['sidebar', { ...sidebar, componentType: 'client' }],
  ['sheet', { ...sheet, componentType: 'client' }],
  ['separator', { ...separator }],
  ['select', { ...select, componentType: 'client' }],
  ['scroll-area', { ...scrollarea }],
  ['resizable', { ...resizable, componentType: 'client' }],
  ['radio-group', { ...radiogroup }],
  ['progress', { ...progress, componentType: 'client' }],
  ['popover', { ...popover }],
  ['pagination', { ...pagination }],
  ['navigation-menu', { ...navigationmenu }],
  ['menubar', { ...menubar, componentType: 'client' }],
  ['label', { ...label }],
  ['input', { ...input }],
  ['input-otp', { ...inputotp, componentType: 'client' }],
  ['hover-card', { ...hovercard, componentType: 'client' }],
  ['form', { ...form, componentType: 'client' }],
  ['dropdown-menu', { ...dropdownmenu }],
  ['drawer', { ...drawer, componentType: 'client' }],
  ['dialog', { ...dialog, componentType: 'client' }],
  ['context-menu', { ...contextmenu }],
  ['command', { ...command }],
  ['collapsible', { ...collapsible, componentType: 'client' }],
  ['checkbox', { ...checkbox }],
  ['chart', { ...chart, componentType: 'client' }],
  ['carousel', { ...carousel, componentType: 'client' }],
  ['card', { ...card }],
  ['calendar', { ...calendar, componentType: 'client' }],
  ['button', { ...button }],
  ['breadcrumb', { ...breadcrumb }],
  ['badge', { ...badge }],
  ['avatar', { ...avatar, componentType: 'client' }],
  ['aspect-ratio', { ...aspectratio }],
  ['animated-hover-nav', { ...animatedhovernav, componentType: 'client' }],
  ['alert', { ...alert }],
  ['alert-dialog', { ...alertdialog }],
  ['accordion', { ...accordion }],
  ['SearchResults', { ...SearchResults, componentType: 'client' }],
  ['SearchResults copy', { ...SearchResultscopy, componentType: 'client' }],
  ['data', { ...data }],
  ['PreviewSearchIcon', { ...PreviewSearchIcon }],
  ['PreviewSearch', { ...PreviewSearch }],
  ['Spinner', { ...Spinner }],
  ['TwoColumnCta', { ...TwoColumnCta }],
  ['ThreeColumnCta', { ...ThreeColumnCta }],
  ['Testimonials', { ...Testimonials }],
  ['StatsCounter', { ...StatsCounter }],
  ['Quote', { ...Quote }],
  ['Questions', { ...Questions }],
  ['PromoCta', { ...PromoCta }],
  ['ProjectList', { ...ProjectList }],
  ['ProjectDetails', { ...ProjectDetails }],
  ['ParallaxBanner', { ...ParallaxBanner }],
  ['PageBackground', { ...PageBackground }],
  ['ImageGallery', { ...ImageGallery }],
  ['HeroBanner', { ...HeroBanner }],
  ['Hero', { ...Hero }],
  ['HeadingCta', { ...HeadingCta }],
  ['FourColumnCta', { ...FourColumnCta }],
  ['FiveColumnCta', { ...FiveColumnCta }],
  ['Features', { ...Features }],
  ['DocumentsList', { ...DocumentsList }],
  ['CtaBanner', { ...CtaBanner }],
  ['Comparison', { ...Comparison }],
  ['Carousel', { ...Carousel }],
  ['Card', { ...Card }],
  ['AuthorWidget', { ...AuthorWidget }],
  ['AuthorList', { ...AuthorList }],
  ['AuthorDetails', { ...AuthorDetails }],
  ['ArticleList', { ...ArticleList }],
  ['ArticleDetails', { ...ArticleDetails }],
  ['AppPromo', { ...AppPromo }],
  ['Advert', { ...Advert, componentType: 'client' }],
  ['Accordion', { ...Accordion }],
  ['ParallaxBackgroundImage', { ...ParallaxBackgroundImage }],
  ['IconAccent', { ...IconAccent }],
  ['DottedAccent', { ...DottedAccent }],
  ['DemoUserSwitcher', { ...DemoUserSwitcher, componentType: 'client' }],
  ['CountUp', { ...CountUp }],
  ['Header', { ...Header }],
  ['Footer', { ...Footer }],
  ['Eyebrow', { ...Eyebrow, componentType: 'client' }],
  ['Breadcrumb', { ...Breadcrumb }],
]);

export default componentMap;
