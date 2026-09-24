import { getPeople } from "@/lib/actions/people";
import { PeopleTable } from "@/components/people/people-table";
import { RegisterPersonModal } from "@/components/people/register-person-modal";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  let people: any[] = [];
  let dbError: string | null = null;

  try {
    people = await getPeople();
  } catch (error: any) {
    dbError = error?.message || "Failed to load people records.";
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">People Management</h1>
          <p className="text-sm text-slate-500">
            Register members, configure their expected monthly fees, and track active statuses.
          </p>
        </div>

        <RegisterPersonModal />
      </div>

      {dbError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <h3 className="font-semibold text-base mb-1">Database Error</h3>
          <p className="text-sm text-rose-800">{dbError}</p>
        </div>
      ) : (
        <PeopleTable people={people} />
      )}
    </div>
  );
}
