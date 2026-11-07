import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { toBengaliNumber } from '../utils/schoolLogic';
import { ClassMonthlySummaryRow } from '../utils/pdfReceiptGenerator';

interface CurrentMonthCashFlowBarChartProps {
  currentMonthBn: string;
  totalBilled: number;
  collectedAmount: number;
  pendingAmount: number;
  paidStudentsCount: number;
  pendingStudentsCount: number;
  collectionRate: number;
  pendingRate: number;
  classBreakdown: ClassMonthlySummaryRow[];
  onTriggerDueReminders?: () => void;
}

/**
 * Custom Bengali Tooltip for Cash Flow Bar Chart
 */
const CustomCashFlowTooltip: React.FC<any> = ({ active, payload, label, chartMetric }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const isOverall = data.isOverall;

  return (
    <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 min-w-[200px]">
      <div className="border-b border-slate-700 pb-1.5 flex items-center justify-between gap-2">
        <span className="font-black text-amber-300 text-sm">{data.fullName || label}</span>
        {data.totalStudents !== undefined && (
          <span className="text-[10px] text-slate-300 font-mono">
            মোট: {toBengaliNumber(data.totalStudents)} জন
          </span>
        )}
      </div>

      {isOverall ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-emerald-400 font-bold">
            <span>আদায়কৃত (Paid):</span>
            <span className="font-mono font-black">
              ৳ {toBengaliNumber(data.paidAmount.toLocaleString())} ({toBengaliNumber(data.paidCount)}টি)
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-rose-400 font-bold">
            <span>বকেয়া (Due):</span>
            <span className="font-mono font-black">
              ৳ {toBengaliNumber(data.dueAmount.toLocaleString())} ({toBengaliNumber(data.dueCount)}টি)
            </span>
          </div>
          <div className="pt-1 border-t border-slate-700 flex items-center justify-between text-[11px] text-indigo-300 font-bold">
            <span>আদায় হার:</span>
            <span>{toBengaliNumber(data.collectionRate)}%</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>আদায়কৃত অর্থ:</span>
            </span>
            <span className="font-mono font-black">
              ৳ {toBengaliNumber(data.paidAmount.toLocaleString())}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-rose-400 font-bold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>বকেয়া অর্থ:</span>
            </span>
            <span className="font-mono font-black">
              ৳ {toBengaliNumber(data.dueAmount.toLocaleString())}
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-700/80 flex items-center justify-between gap-2 text-[10px] text-slate-300">
            <span>শিক্ষার্থী স্ট্যাটাস:</span>
            <span>
              ✓ {toBengaliNumber(data.paidCount)} পরিশোধিত · ⚠️ {toBengaliNumber(data.dueCount)} বকেয়া
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] text-amber-300 font-bold">
            <span>আদায় হার (Collection):</span>
            <span>{toBengaliNumber(data.collectionRate)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const CurrentMonthCashFlowBarChart: React.FC<CurrentMonthCashFlowBarChartProps> = ({
  currentMonthBn,
  totalBilled,
  collectedAmount,
  pendingAmount,
  paidStudentsCount,
  pendingStudentsCount,
  collectionRate,
  pendingRate,
  classBreakdown,
  onTriggerDueReminders,
}) => {
  // Chart View Mode: 'class_breakdown' (Side-by-side per class) | 'overall' (Summary comparison)
  const [viewMode, setViewMode] = useState<'class_breakdown' | 'overall'>('class_breakdown');

  // Metric Mode: 'amount' (in BDT ৳) | 'count' (in number of invoices)
  const [metricMode, setMetricMode] = useState<'amount' | 'count'>('amount');

  // Class Breakdown Data for Recharts
  const classChartData = useMemo(() => {
    return classBreakdown.map((cls) => ({
      name: cls.classNameBn,
      fullName: `${cls.classNameBn} শ্রেণি`,
      paidAmount: cls.collectedAmount,
      dueAmount: cls.pendingAmount,
      paidCount: cls.paidStudents,
      dueCount: cls.pendingStudents,
      totalStudents: cls.totalStudents,
      collectionRate: cls.collectionRate,
      isOverall: false,
    }));
  }, [classBreakdown]);

  // Overall Cash Flow Data for Recharts
  const overallChartData = useMemo(() => {
    return [
      {
        name: 'পরিশোধিত (Paid)',
        shortName: 'আদায়কৃত',
        fullName: `চলতি মাস (${currentMonthBn}) — মোট আদায়কৃত ইনভয়েস`,
        amount: collectedAmount,
        count: paidStudentsCount,
        percentage: collectionRate,
        paidAmount: collectedAmount,
        dueAmount: pendingAmount,
        paidCount: paidStudentsCount,
        dueCount: pendingStudentsCount,
        collectionRate,
        fill: '#059669', // Emerald 600
        isOverall: true,
      },
      {
        name: 'বকেয়া (Due)',
        shortName: 'বকেয়া',
        fullName: `চলতি মাস (${currentMonthBn}) — মোট বকেয়া/পেন্ডিং ইনভয়েস`,
        amount: pendingAmount,
        count: pendingStudentsCount,
        percentage: pendingRate,
        paidAmount: collectedAmount,
        dueAmount: pendingAmount,
        paidCount: paidStudentsCount,
        dueCount: pendingStudentsCount,
        collectionRate,
        fill: '#E11D48', // Rose 600
        isOverall: true,
      },
    ];
  }, [
    currentMonthBn,
    collectedAmount,
    pendingAmount,
    paidStudentsCount,
    pendingStudentsCount,
    collectionRate,
    pendingRate,
  ]);

  // Cash Flow Health Evaluation
  const isHealthyCashFlow = collectionRate >= 75;
  const isCriticalCashFlow = collectionRate < 50;

  return (
    <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 shadow-sm space-y-5">
      {/* ========================================================================= */}
      {/* 1. CHART HEADER & CONTROLS (Toggles for View & Metric)                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  নগদ প্রবাহ বার চার্ট (Cash Flow Bar Chart)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Recharts ইঞ্জিন
                </span>
              </div>
              <p className="text-xs text-slate-500">
                চলতি মাসের ({currentMonthBn}) আদায়কৃত (Paid) বনাম বকেয়া (Due) ইনভয়েসের তুলনামূলক ভিজুয়ালাইজেশন
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* View Mode Toggle: Class Breakdown vs Overall */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('class_breakdown')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'class_breakdown'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>শ্রেণিভিত্তিক তুলনা</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('overall')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'overall'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>সার্বিক সামারি</span>
            </button>
          </div>

          {/* Metric Toggle: Amount ৳ vs Count */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setMetricMode('amount')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                metricMode === 'amount'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>অর্থের পরিমাণ (৳)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                metricMode === 'count'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>ইনভয়েস সংখ্যা (টি)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RECHARTS RESPONSIVE BAR CHART CONTAINER                                 */}
      {/* ========================================================================= */}
      <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200">
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'class_breakdown' ? (
              <BarChart
                data={classChartData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                barGap={8}
                barCategoryGap="24%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#1E293B', fontSize: 12, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  tickFormatter={(val: number) =>
                    metricMode === 'amount'
                      ? `৳${toBengaliNumber((val / 1000).toFixed(0))}k`
                      : `${toBengaliNumber(val)}টি`
                  }
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  content={<CustomCashFlowTooltip chartMetric={metricMode} />}
                  cursor={{ fill: '#E0E7FF', opacity: 0.3 }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 14 }}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-700">{value}</span>
                  )}
                />
                {/* Reference line for visually balanced layout */}
                <ReferenceLine y={0} stroke="#94A3B8" />

                {/* Paid Bar (Emerald) */}
                <Bar
                  dataKey={metricMode === 'amount' ? 'paidAmount' : 'paidCount'}
                  name={
                    metricMode === 'amount'
                      ? 'আদায়কৃত অর্থ — Paid (৳)'
                      : 'পরিশোধিত ইনভয়েস (টি)'
                  }
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />

                {/* Due Bar (Rose) */}
                <Bar
                  dataKey={metricMode === 'amount' ? 'dueAmount' : 'dueCount'}
                  name={
                    metricMode === 'amount'
                      ? 'বকেয়া অর্থ — Due (৳)'
                      : 'বকেয়া ইনভয়েস (টি)'
                  }
                  fill="#E11D48"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            ) : (
              /* Overall Comparison Single BarChart */
              <BarChart
                data={overallChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                barCategoryGap="35%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#1E293B', fontSize: 13, fontWeight: 800 }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  tickFormatter={(val: number) =>
                    metricMode === 'amount'
                      ? `৳${toBengaliNumber((val / 1000).toFixed(0))}k`
                      : `${toBengaliNumber(val)}টি`
                  }
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  content={<CustomCashFlowTooltip chartMetric={metricMode} />}
                  cursor={{ fill: '#F1F5F9', opacity: 0.4 }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 14 }}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-700">{value}</span>
                  )}
                />
                <Bar
                  dataKey={metricMode === 'amount' ? 'amount' : 'count'}
                  name={
                    metricMode === 'amount'
                      ? 'সার্বিক নগদ অর্থ (৳)'
                      : 'মোট ইনভয়েস সংখ্যা (টি)'
                  }
                  radius={[8, 8, 0, 0]}
                  maxBarSize={70}
                >
                  {overallChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CASH FLOW INSIGHTS & STATISTICAL METRICS STRIP                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Metric 1: Cash Inflow Realized */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="font-bold">মোট নগদ আদায় (Inflow):</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
            ৳ {toBengaliNumber(collectedAmount.toLocaleString())}
          </div>
          <span className="text-[10px] text-emerald-700 block">
            {toBengaliNumber(paidStudentsCount)}টি ইনভয়েস আদায় সম্পন্ন ({toBengaliNumber(collectionRate)}%)
          </span>
        </div>

        {/* Metric 2: Pending Outstandings */}
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
          <div className="flex items-center justify-between text-rose-800">
            <span className="font-bold">বকেয়া নগদ অর্থ (Due):</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-700 font-mono">
            ৳ {toBengaliNumber(pendingAmount.toLocaleString())}
          </div>
          <span className="text-[10px] text-rose-700 block">
            {toBengaliNumber(pendingStudentsCount)}টি ইনভয়েস অপরিশোধিত ({toBengaliNumber(pendingRate)}%)
          </span>
        </div>

        {/* Metric 3: Total Billed */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold">মোট ধার্যকৃত ক্যাশ (Target):</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
            ৳ {toBengaliNumber(totalBilled.toLocaleString())}
          </div>
          <span className="text-[10px] text-slate-500 block">
            চলতি মাসের নির্ধারিত লক্ষ্যমাত্রা
          </span>
        </div>

        {/* Metric 4: Cash Flow Health Status */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            isHealthyCashFlow
              ? 'bg-teal-50 border-teal-200 text-teal-900'
              : isCriticalCashFlow
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold">ক্যাশ ফ্লো স্বাস্থ্য স্কোর:</span>
            {isHealthyCashFlow ? (
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-sm font-black flex items-center gap-1.5 mt-0.5">
            {isHealthyCashFlow ? (
              <span className="text-teal-700">চমৎকার নগদ প্রবাহ ✓</span>
            ) : isCriticalCashFlow ? (
              <span className="text-rose-700">সতর্কবার্তা: বকেয়া বেশি ⚠️</span>
            ) : (
              <span className="text-indigo-700">সন্তোষজনক প্রবাহ</span>
            )}
          </div>
          <span className="text-[10px] block opacity-80">
            {isHealthyCashFlow
              ? 'স্কুলের তহবিল ও চলতি খরচ নিরাপদ রয়েছে'
              : 'অভিভাবকদের নোটিফিকেশন তাগাদা পাঠানোর পরামর্শ'}
          </span>
        </div>
      </div>
    </div>
  );
};
