'use client';
import { JSX } from 'react';
import { Input } from "../../components/ui/input"
import { Search } from "lucide-react"
import {
  Field,
  withDatasourceCheck,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Button } from "../../components/ui/button"

export type BlogSearchProps = ComponentProps & {
  fields: {
    Title: Field<string>;
    Subtitle: Field<string>;
  }
};

const categories = [
  "All",
  "Destinations",
  "Travel Tips",
  "Food & Culture",
  "Sustainable Travel",
  "Family Travel",
  "Nightlife",
  "Culture",
]

const BlogSearch = (props: BlogSearchProps): JSX.Element => {
  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><Text field={props.fields.Title} /></h1>
          <p className="text-xl text-blue-100 mb-8">
            <Text field={props.fields.Subtitle} />
          </p>

          {/* Search Bar */}
          {/* TODO: Implement Sitecore Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input placeholder="Search articles..." className="pl-10 bg-white text-gray-900" />
          </div>
        </div>
      </section>
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Button key={index} variant={index === 0 ? "default" : "outline"} size="sm" className="mb-2">
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export const Default = withDatasourceCheck()<BlogSearchProps>(BlogSearch);
