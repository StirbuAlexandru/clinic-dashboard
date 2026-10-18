import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyRevenue } from '../types'

interface RevenueChartProps {
    data: MonthlyRevenue[]
}


function formatMonth(month: string) {
    const [year, monthNumber] = month.split('-')
    return new Date(Number(year), Number(monthNumber) - 1).toLocaleString('en-US', { month: 'short' })
}

function formatDollars(cents: number) {
    return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    })
}



function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="panel">
            <h2 className="panel-title">Revenue by month</h2>
            <p className="panel-subtitle">Money collected vs. money still expected, by visit month</p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} barGap={2}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={formatDollars} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                        formatter={(value) => formatDollars(Number(value))}
                        labelFormatter={(label) => formatMonth(String(label))}
                    />
                    <Legend />
                    <Bar dataKey="paid_cents" name="Collected" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending_cents" name="Pending" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default RevenueChart
