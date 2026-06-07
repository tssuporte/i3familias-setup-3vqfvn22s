import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
]

const chartConfig = {
  stars: { label: 'Estrelas', color: 'hsl(var(--primary))' },
  count: { label: 'Concluídas', color: 'hsl(var(--primary))' },
  value: { label: 'Total' },
}

export default function DashboardCharts({
  starsPerChild,
  tasksPerType,
  activityWeekly,
}: {
  starsPerChild: any[]
  tasksPerType: any[]
  activityWeekly: any[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <Card
        className="p-6 rounded-lg shadow-sm border animate-fade-in-up flex flex-col"
        style={{ animationDelay: '100ms' }}
      >
        <h3 className="text-lg font-bold mb-4">Estrelas por Criança</h3>
        <div className="h-60 lg:h-80 w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={starsPerChild}
                layout="vertical"
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.2} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={
                    <ChartTooltipContent className="bg-slate-900 text-white rounded-md shadow-lg border-none" />
                  }
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  name="Estrelas"
                  dataKey="stars"
                  fill="var(--color-stars)"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      <Card
        className="p-6 rounded-lg shadow-sm border animate-fade-in-up flex flex-col"
        style={{ animationDelay: '200ms' }}
      >
        <h3 className="text-lg font-bold mb-4">Tarefas por Tipo</h3>
        <div className="h-60 lg:h-80 w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent className="bg-slate-900 text-white rounded-md shadow-lg border-none" />
                  }
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Pie
                  data={tasksPerType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  animationDuration={1000}
                >
                  {tasksPerType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      <Card
        className="p-6 rounded-lg shadow-sm border animate-fade-in-up flex flex-col"
        style={{ animationDelay: '300ms' }}
      >
        <h3 className="text-lg font-bold mb-4">Atividade Semanal</h3>
        <div className="h-60 lg:h-80 w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityWeekly}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={12} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent className="bg-slate-900 text-white rounded-md shadow-lg border-none" />
                  }
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  name="Concluídas"
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  )
}
