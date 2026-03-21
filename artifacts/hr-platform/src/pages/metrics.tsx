import { 
  useGetTimeToHireMetrics, 
  useGetFunnelMetrics, 
  useGetHiresOverTime 
} from "@workspace/api-client-react";
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
  LineChart
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Metrics() {
  const { data: timeToHire, isLoading: load1 } = useGetTimeToHireMetrics();
  const { data: funnel, isLoading: load2 } = useGetFunnelMetrics();
  const { data: hires, isLoading: load3 } = useGetHiresOverTime();

  if (load1 || load2 || load3) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl col-span-1 lg:col-span-2" />
        </div>
      </div>
    );
  }

  // Enhance funnel data for chart
  const funnelData = funnel?.map((f, i) => ({
    ...f,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    displayValue: `${f.count} (${f.conversionRate}%)`
  })) || [];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Métricas de Performance</h1>
        <p className="text-muted-foreground mt-1 text-lg">Analise a eficiência e gargalos do seu processo de R&S.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Time to Hire Chart */}
        <Card className="shadow-sm border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Time-to-Hire por Departamento (Dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeToHire} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="department" type="category" stroke="hsl(var(--foreground))" fontSize={13} fontWeight={500} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgDays" name="Dias em Média" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32}>
                    <LabelList dataKey="avgDays" position="right" fill="hsl(var(--muted-foreground))" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Chart */}
        <Card className="shadow-sm border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Funil de Conversão Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4 flex items-center justify-center bg-slate-50/50 rounded-xl">
              <ResponsiveContainer width="100%" height="90%">
                <FunnelChart>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="count"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="label" fontSize={13} fontWeight={500} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {funnelData.map((f, i) => (
                <div key={i} className="flex items-center text-xs">
                  <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: f.fill }} />
                  <span className="text-muted-foreground mr-1">{f.label}:</span>
                  <span className="font-semibold">{f.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hires Over Time Line Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Volume de Vagas vs. Contratações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hires} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="openings" 
                    name="Novas Vagas" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "hsl(var(--chart-2))", strokeWidth: 2, stroke: "#fff" }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hires" 
                    name="Contratações" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} 
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
