import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import { ExportButton } from "@/components/CardActionMenus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  SummaryCards,
  AchievementByYear,
  ChartProjectOverview,
  ChartProjectEfficiency,
  TableRecentProjects,
  Reminders,
  SuccessMetrics,
  Reports
} from "./components";
import CampoBoasVindas from "@/components/boasvindas";

export default function Page() {
  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2">
        <CampoBoasVindas />
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <ExportButton />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="z-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="activities" disabled>
            Activities
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <SummaryCards />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartProjectOverview />
            </div>
            <SuccessMetrics />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
            <Reminders />
            <AchievementByYear />
            <ChartProjectEfficiency />
          </div>
          <TableRecentProjects />
        </TabsContent>
        <TabsContent value="reports">
          <Reports />
        </TabsContent>
        <TabsContent value="activities">...</TabsContent>
      </Tabs>
    </>
  );
}
