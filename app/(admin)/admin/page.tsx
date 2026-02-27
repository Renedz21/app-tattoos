import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { RequestStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { Image, LayoutDashboard } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/components/ui/tabs";
import { DataTable } from "@/modules/core/components/ui/data-table";
import { columns } from "@/modules/admin/columns";
import { adminFiltersSchema } from "@/modules/schemas/admin-filters.schema";
import AdminFilters from "@/modules/admin/components/admin-filter";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const session = await getServerSession();

  if (!session?.user || !isAdminEmail(session.user.email)) {
    redirect("/admin/login");
  }

  const rawParams = await searchParams;
  const filters = adminFiltersSchema.parse({
    search: rawParams.search ?? "",
    status: rawParams.status ?? "",
  });

  const data = await prisma.tattooRequest.findMany({
    where: {
      ...(filters.search
        ? { fullName: { contains: filters.search, mode: "insensitive" } }
        : {}),
      ...(filters.status ? { status: filters.status as RequestStatus } : {}),
    },
    select: {
      requestCode: true,
      fullName: true,
      style: true,
      status: true,
      sentAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Tabs defaultValue="leads">
        <TabsList className="bg-card border border-border/50 mb-6">
          <TabsTrigger
            value="leads"
            className="font-body gap-2 data-[state=active]:text-primary"
          >
            <LayoutDashboard size={16} /> Leads
          </TabsTrigger>
          <TabsTrigger
            value="portfolio"
            className="font-body gap-2 data-[state=active]:text-primary"
            disabled
          >
            <Image size={16} /> Portafolio
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="space-y-6">
          <Suspense fallback={<>Loading...</>}>
            <AdminFilters />
          </Suspense>

          <div>
            <DataTable columns={columns} data={data} />
          </div>
        </TabsContent>
        <TabsContent value="portfolio">Proximamente</TabsContent>
      </Tabs>
    </>
  );
}
