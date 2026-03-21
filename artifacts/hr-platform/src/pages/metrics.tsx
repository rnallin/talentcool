import {
  useGetTimeToHireMetrics,
  useGetFunnelMetrics,
  useGetHiresOverTime,
} from "@workspace/api-client-react";
import type { FunnelStage, TimeToHireByDept, MonthlyHires } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color as string }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Metrics() {
  const { data: timeToHire, isLoading: load1 } = useGetTimeToHireMetrics();
  const { data: funnel, isLoading: load2 } = useGetFunnelMetrics();
  const { data: hires, isLoading: load3 } = useGetHiresOverTime();

  if (load1 || load2 || load3) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl col-span-1 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const funnelData: (FunnelStage & { fill: string; displayValue: string })[] =
    funnel?.map((f, i) => ({
      ...f,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
      displayValue: `${f.count} (${f.conversionRate}%)`,
    })) ?? [];

  const timeToHireData: TimeToHireByDept[] = timeToHire ?? [];
  const hiresData: MonthlyHires[] = hires ?? [];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Métricas de Performance
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Analise a eficiência e gargalos do seu processo de R&S.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time to Hire Chart */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Time-to-Hire por Departamento (Dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeToHireData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="department"
                    type="category"
                    stroke="hsl(var(--foreground))"
                    fontSize={13}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="avgDays"
                    name="Dias em Média"
                    fill="#0d9488"
                    radius={[0, 4, 4, 0]}
                    barSize={28}
                  >
                    <LabelList
                      dataKey="avgDays"
                      position="right"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Chart */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Funil de Conversão Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="90%">
                <FunnelChart>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Funnel dataKey="count" data={funnelData} isAnimationActive>
                    <LabelList
                      position="right"
                      fill="#000"
                      stroke="none"
                      dataKey="label"
                      fontSize={13}
                      fontWeight={500}
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {funnelData.map((f, i) => (
                <div key={i} className="flex items-center text-xs">
                  <div
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: f.fill }}
                  />
                  <span className="text-muted-foreground mr-1">{f.label}:</span>
                  <span className="font-semibold">{f.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hires Over Time */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Volume de Vagas vs. Contratações (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hiresData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="openings"
                    name="Novas Vagas"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hires"
                    name="Contratações"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
