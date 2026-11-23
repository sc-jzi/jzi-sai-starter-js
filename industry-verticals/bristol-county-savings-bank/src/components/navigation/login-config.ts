// Login panel of the header (hardcoded chrome, not CMS driven): the account types, targets and promo of the bank's live login panel.
// Online banking is a separate site hosted by the bank's core provider; the demo only links to it.
export const loginConfig: {
  buttonLabel: string;
  title: string;
  accountTypeLabel: string;
  submitLabel: string;
  closeLabel: string;
  accounts: { label: string; href: string }[];
  links: { label: string; href: string }[];
  promo: { image: string; title: string; text: string; cta: { label: string; href: string } } | null;
} = {
  buttonLabel: 'Login',
  title: 'Log in to your account.',
  accountTypeLabel: 'Account type',
  submitLabel: 'Log In',
  closeLabel: 'Close login panel',
  accounts: [
    { label: 'Online Banking', href: 'https://secure.myvirtualbranch.com/BristolCountySavingsBank/SignIn.aspx' },
    { label: 'Lockbox', href: 'https://lighthouse.myclearingworks.com/Clearingworks/' },
    { label: 'Credit Cards', href: 'https://www.myaccountaccess.com/onlineCard/login.do' },
  ],
  links: [
    { label: 'Register for Digital Banking', href: 'https://secure.myvirtualbranch.com/BristolCountySavingsBank/SignIn.aspx' },
  ],
  promo: {
    image:
      'https://www.bristolcountysavings.com/BristolCountySavingsBank/media/Site-Images/olb-promo-sm-business-lending.jpg',
    title: 'Grow Your Business With Us',
    text: 'Give your business financial flexibility with our lending options.',
    cta: { label: 'Learn More', href: 'https://www.bristolcountysavings.com/Small-Business/Lending' },
  },
};
