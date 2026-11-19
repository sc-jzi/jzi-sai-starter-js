// Login panel of the header (hardcoded chrome, not CMS driven): the account types and targets of the bank's live header.
// Online banking is a separate site hosted by the bank's core provider; the demo only links to it.
export const loginConfig: {
  buttonLabel: string;
  accountTypeLabel: string;
  placeholder: string;
  submitLabel: string;
  accounts: { label: string; href: string }[];
  links: { label: string; href: string }[];
} = {
  buttonLabel: 'Login',
  accountTypeLabel: 'Account type',
  placeholder: 'select an option...',
  submitLabel: 'Log In',
  accounts: [
    { label: 'Online Banking', href: 'https://secure.myvirtualbranch.com/BristolCountySavingsBank/SignIn.aspx' },
    { label: 'Lockbox', href: 'https://lighthouse.myclearingworks.com/Clearingworks/' },
    { label: 'Credit Cards', href: 'https://www.myaccountaccess.com/onlineCard/login.do' },
  ],
  links: [
    { label: 'Register for Digital Banking', href: 'https://secure.myvirtualbranch.com/BristolCountySavingsBank/SignIn.aspx' },
  ],
};
