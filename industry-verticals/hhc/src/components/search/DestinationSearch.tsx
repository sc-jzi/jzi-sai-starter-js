'use client';
import { JSX } from 'react';
import {
  Field,
  withDatasourceCheck,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  Search,
} from "lucide-react"

export type DestinationSearchProps = ComponentProps & {
  fields: {
    Title: Field<string>;
    Subtitle: Field<string>;
  }
};

const continents = ["All", "Europe", "Asia", "North America", "South America", "Africa", "Oceania"]
const types = ["All", "City", "Beach", "Mountain", "Adventure", "Cultural"]
const activities = ["All", "Culture", "Adventure", "Beach", "Food", "History", "Nature"]

const DestinationSearch = (props: DestinationSearchProps): JSX.Element => {
  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><Text field={props.fields.Title} /></h1>
          <p className="text-xl text-blue-100 mb-8">
            <Text field={props.fields.Subtitle} />
          </p>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input placeholder="Search destinations..." className="pl-10 text-gray-900" />
              </div>

              <Select>
                <SelectTrigger className="text-gray-900">
                  <SelectValue placeholder="Continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map((continent) => (
                    <SelectItem key={continent} value={continent.toLowerCase()}>
                      {continent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="text-gray-900">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="text-gray-900">
                  <SelectValue placeholder="Activities" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity} value={activity.toLowerCase()}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const Default = withDatasourceCheck()<DestinationSearchProps>(DestinationSearch);
