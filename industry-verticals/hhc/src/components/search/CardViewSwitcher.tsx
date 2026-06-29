'use client';
import React from 'react';

import { CardViewSwitcher } from '@sitecore-search/ui';

type CardViewSwitcherProps = {
  onToggle: (value: string) => void;
  defaultCardView: 'list' | 'grid';
  GridIcon: React.FC;
  ListIcon: React.FC;
};

const CardViewSwitcherComponent = ({
  onToggle,
  defaultCardView,
  GridIcon,
  ListIcon,
}: CardViewSwitcherProps) => {
  return (
    <CardViewSwitcher.Root
      onValueChange={onToggle}
      defaultValue={defaultCardView}
      className="inline-flex"
    >
      <CardViewSwitcher.Item
        value="grid"
        aria-label="Grid View"
        className="focus:outline-grey-800 mr-2 ml-0 flex h-[30px] w-[30px] items-center justify-center rounded-md bg-white text-gray-500 hover:bg-gray-100 data-[state=on]:bg-gray-800 data-[state=on]:text-white dark:bg-gray-800 dark:data-[state=on]:bg-gray-300 dark:data-[state=on]:text-gray-600"
      >
        <GridIcon />
      </CardViewSwitcher.Item>
      <CardViewSwitcher.Item
        value="list"
        aria-label="List View"
        className="focus:outline-grey-800 ml-0 flex h-[30px] w-[30px] items-center justify-center rounded-md bg-white text-gray-500 hover:bg-gray-100 data-[state=on]:bg-gray-800 data-[state=on]:text-white dark:bg-gray-800 dark:data-[state=on]:bg-gray-300 dark:data-[state=on]:text-gray-600"
      >
        <ListIcon />
      </CardViewSwitcher.Item>
    </CardViewSwitcher.Root>
  );
};

export default CardViewSwitcherComponent;
