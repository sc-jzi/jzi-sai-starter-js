import { redirect } from 'next/navigation';

/** The Full screen extension point opens /catalog. */
export default function Home() {
  redirect('/catalog');
}
