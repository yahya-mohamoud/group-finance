import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonById } from "@/lib/actions/people";
import { PersonDetailsView } from "@/components/people/person-details-view";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface PersonDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function PersonDetailsPage({ params }: PersonDetailsPageProps) {
  let person;

  try {
    person = await getPersonById(params.id);
  } catch (err) {
    // Database connection error
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
        <h3 className="font-semibold text-base mb-1">Database Error</h3>
        <p className="text-sm">Unable to retrieve person details at this time.</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Person Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested member could not be found or has been removed.
        </p>
        <Link href="/people" className="mt-4 inline-block">
          <Button variant="outline">Back to People List</Button>
        </Link>
      </div>
    );
  }

  return <PersonDetailsView person={person} />;
}
