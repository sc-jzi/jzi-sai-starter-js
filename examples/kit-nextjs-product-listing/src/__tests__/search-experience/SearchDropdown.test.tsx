import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchDropdown } from '../../components/search-experience/search-components/SearchDropdown';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mapping = {};
const fieldPreviewEnabled = {};

describe('SearchDropdown', () => {
  it('renders QuerySuggestionItem objects without treating them as strings', async () => {
    const onTermSelect = jest.fn();

    render(
      <SearchDropdown
        terms={[
          { text: 'sitecore', queryPlusText: 'sitecore' },
          { text: 'sitecoreai', queryPlusText: 'sitecoreai' },
        ]}
        previewResults={[]}
        previewTotal={0}
        mapping={mapping}
        fieldPreviewEnabled={fieldPreviewEnabled}
        onTermSelect={onTermSelect}
        onPreviewSelect={jest.fn()}
      />
    );

    expect(screen.getByText('sitecore')).toBeInTheDocument();
    expect(screen.getByText('sitecoreai')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /sitecoreai/i }));
    expect(onTermSelect).toHaveBeenCalledWith('sitecoreai');
  });
});
