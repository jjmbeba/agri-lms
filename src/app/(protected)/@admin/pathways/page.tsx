import { IconCertificate2 } from "@tabler/icons-react";
import { preloadQuery } from "convex/nextjs";
import PathwayManager from "@/components/features/admin/pathways/pathway-manager";
import { api } from "../../../../../convex/_generated/api";

export default async function PathwaysPage() {
  // Server: fetch all pathways using convex preloadQuery
  const preloadedPathways = await preloadQuery(api.pathways.getPathways, {});

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Section */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <IconCertificate2
                    aria-label="Pathway Icon"
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h1
                    aria-label="Certification Pathways Management"
                    className="font-bold text-2xl tracking-tight"
                  >
                    Certification Pathways
                  </h1>
                  <p className="text-muted-foreground">
                    Create and manage course certification pathways
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Pathway Management (client) */}
          <PathwayManager preloadedPathways={preloadedPathways} />
        </div>
      </div>
    </div>
  );
}
