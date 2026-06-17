// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as PromoCta from 'src/components/PageContent/PromoCta';
import * as Carousel from 'src/components/PageContent/Carousel';
import * as ArticleList from 'src/components/PageContent/ArticleList';
import * as ArticleDetails from 'src/components/PageContent/ArticleDetails';
import * as Header from 'src/components/Navigation/Header';
import * as Footer from 'src/components/Navigation/Footer';
import * as Eyebrow from 'src/components/Navigation/Eyebrow';
import * as Breadcrumb from 'src/components/Navigation/Breadcrumb';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['PromoCta', { ...PromoCta, componentType: 'client' }],
  ['Carousel', { ...Carousel, componentType: 'client' }],
  ['ArticleList', { ...ArticleList, componentType: 'client' }],
  ['ArticleDetails', { ...ArticleDetails }],
  ['Header', { ...Header }],
  ['Footer', { ...Footer }],
  ['Eyebrow', { ...Eyebrow }],
  ['Breadcrumb', { ...Breadcrumb }],
]);

export default componentMap;
