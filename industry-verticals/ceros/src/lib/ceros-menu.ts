/**
 * Ceros header extras, hardcoded (not editable in the CMS, as agreed at the plan approval):
 * - the dropdown panels under Products, Solutions and Resources (ceros.com opens them on hover; the shared Navigation renders the top level only)
 * - the two header buttons.
 * Labels and targets come from the measured menu (docs/ai/demos/ceros/nav.json). Pages that exist in this site link internally; the rest go to ceros.com.
 * The top-level items themselves come from Sitecore (Navigation, datasource Home, Main Navigation filter).
 */
export type CerosMenuLink = { label: string; href: string; description?: string; external?: boolean };

export const cerosMenuPanels: Record<string, CerosMenuLink[]> = {
  Products: [
    { label: 'Flex', href: '/flex', description: 'An unrivaled design studio with limitless creative control' },
    { label: 'Flex AI', href: '/ai', description: 'Your AI design collaborator for faster, smarter content creation' },
    { label: 'Integrations', href: '/embed-library', description: 'Tools and integrations you can embed in Flex, ready to use' },
    { label: 'MarkUp', href: '/mark-up', description: 'The easiest way to give and receive feedback on PDFs, websites & videos' },
  ],
  Solutions: [
    { label: 'Brands', href: '/industries-hub/brands' },
    { label: 'Consulting', href: '/industries-hub/consulting' },
    { label: 'IT', href: '/industries-hub/it-services-and-software' },
    { label: 'Construction', href: '/industries-hub/construction' },
    { label: 'Financial services', href: '/industries-hub/financial-services' },
    { label: 'Healthcare', href: '/industries-hub/healthcare' },
    { label: 'Agencies', href: '/industries-hub/agency' },
    { label: 'Insurance', href: '/industries-hub/insurance' },
    { label: 'Media & publishing', href: '/industries-hub/media-publishing' },
    { label: 'Professional services', href: '/industries-hub/professional-services' },
    { label: 'Real estate', href: '/industries-hub/real-estate' },
    { label: 'Technology', href: '/industries-hub/technology' },
    { label: 'Customer Stories', href: '/customer-stories', description: 'See how leading brands use Ceros to create content that captivates.' },
  ],
  Resources: [
    { label: 'Templates', href: '/templates' },
    { label: 'Components', href: '/components' },
    { label: 'Product updates', href: 'https://product-releases.ceros.site/flex-product-updates', external: true },
    { label: 'Help center', href: 'https://educate.ceros.com/en/', external: true },
    { label: 'Blog', href: '/blog' },
    { label: 'Video lessons', href: 'https://learning-library.ceros.com/page/tutorial-videos', external: true },
    { label: 'Webinars & trainings', href: 'https://learning-library.ceros.com/page/webinars-and-training', external: true },
    { label: 'Interactive demo hub', href: '/demo-hub' },
    { label: 'Ceros gallery', href: '/examples' },
    { label: 'About Ceros', href: '/about' },
    { label: 'Before & after Ceros', href: '/before-and-after-ceros' },
    { label: 'Explore careers', href: '/careers' },
  ],
};

export const cerosHeaderButtons: CerosMenuLink[] = [
  { label: 'Talk to an expert', href: 'https://www.ceros.com/demo-request/', external: true },
  { label: 'Start for free', href: 'https://www.ceros.com/demo-request/', external: true },
];
