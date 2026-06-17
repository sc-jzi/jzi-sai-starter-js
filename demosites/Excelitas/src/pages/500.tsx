import { JSX } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { SitecorePageProps, ErrorPage } from '@sitecore-content-sdk/nextjs';
import Layout from 'src/Layout';
import scConfig from 'sitecore.config';
import client from 'lib/sitecore-client';
import components from '.sitecore/component-map';
import Providers from 'src/Providers';

/**
 * Rendered in case if we have 500 error
 */
const ServerError = (): JSX.Element => (
  <>
    <Head>
      <title>500: Server Error | Excelitas</title>
    </Head>
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-excelitas-gray-50 px-4 py-20 text-center">
      <p className="eyebrow mb-2">Error 500</p>
      <h1 className="mb-4 text-excelitas-gray-900">Internal server error</h1>
      <p className="mb-8 max-w-md text-lg text-excelitas-gray-500">
        There is a problem with the resource you are looking for, and it cannot be displayed.
      </p>
      <a href="/" className="btn-excelitas">
        Return to homepage
      </a>
    </div>
  </>
);

const Custom500 = (props: SitecorePageProps): JSX.Element => {
  if (!(props && props.page)) {
    return <ServerError />;
  }

  return (
    <Providers componentProps={props.componentProps} page={props.page}>
      <Layout page={props.page} />
    </Providers>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const props: SitecorePageProps = {
    page: null,
  };

  if (scConfig.generateStaticPaths) {
    try {
      props.page = await client.getErrorPage(ErrorPage.InternalServerError, {
        site: scConfig.defaultSite,
        locale: context.locale || context.defaultLocale || scConfig.defaultLanguage,
      });
    } catch (error) {
      console.log('Error occurred while fetching error pages');
      console.log(error);
    }
  }

  if (props.page) {
    props.componentProps = await client.getComponentData(props.page.layout, context, components);
  }

  return {
    props,
  };
};

export default Custom500;
