// @ts-nocheck
import { useTheme } from '../../contexts/ThemeContext';
import { useLayoutGlobalScreen } from './useLayoutGlobalScreen';

export default function LayoutGlobalScreen() {
  const { isDark } = useTheme();
  const handlers = useLayoutGlobalScreen();

  return (
    <section className="flex-1 p-lg flex flex-col gap-gutter  text-on-background max-w-[1600px] mx-auto w-full">
      {isDark ? <LayoutGlobalDarkView /> : <LayoutGlobalLightView />}
    </section>
  );
}

function LayoutGlobalLightView(props: ReturnType<typeof useLayoutGlobalScreen>) {
  return (
    <>
      
<section className="max-w-[1600px] mx-auto w-full">

<section className="mb-xl">
<h2 className="font-headline-md text-headline-md text-on-background">Welcome back, Admin</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">Here's what's happening at AgroPet today.</p>
</section>

<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">

<section className="bg-backgroundest border border-outline-variant rounded-xl p-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-md">
<section className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
</section>
<span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                    +12.5%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Daily Revenue</h3>
<section className="font-headline-md text-headline-md text-on-background">R$ 4.250,00</section>
</section>

<section className="bg-backgroundest border border-outline-variant rounded-xl p-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-md">
<section className="w-12 h-12 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
</section>
<span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                    +5.2%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Products Sold</h3>
<section className="font-headline-md text-headline-md text-on-background">142</section>
</section>

<section className="bg-backgroundest border border-outline-variant rounded-xl p-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-md">
<section className="w-12 h-12 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
</section>
<span className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
                                    -2.1%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Appointments Today</h3>
<section className="font-headline-md text-headline-md text-on-background">28</section>
</section>

<section className="bg-backgroundest border border-outline-variant rounded-xl p-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-md">
<section className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
</section>
<span className="flex items-center text-sm font-medium text-surface-variant/70 bg-surface-variant/20 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">horizontal_rule</span>
                                    0%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">New Pets Registered</h3>
<section className="font-headline-md text-headline-md text-on-background">12</section>
</section>
</section>

<section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

<section className="lg:col-span-2 bg-backgroundest border border-outline-variant rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
<section className="p-lg border-b border-outline-variant flex justify-between items-center">
<h3 className="font-title-lg text-title-lg text-on-background">Recent Transactions</h3>
<button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">View All</button>
</section>
<section className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-background border-b border-outline-variant">
<th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Transaction ID</th>
<th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Client</th>
<th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
<th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
<th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Status</th>
</tr>
</thead>
<tbody className="font-body-sm text-body-sm text-on-background">
<tr className="border-b border-outline-variant hover:bg-background transition-colors">
<td className="py-md px-lg">#TRX-8923</td>
<td className="py-md px-lg font-medium">Maria Silva</td>
<td className="py-md px-lg text-on-surface-variant">Today, 10:45 AM</td>
<td className="py-md px-lg text-right font-medium">R$ 245,50</td>
<td className="py-md px-lg text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
</td>
</tr>
<tr className="border-b border-outline-variant hover:bg-background transition-colors">
<td className="py-md px-lg">#TRX-8922</td>
<td className="py-md px-lg font-medium">João Souza</td>
<td className="py-md px-lg text-on-surface-variant">Today, 09:30 AM</td>
<td className="py-md px-lg text-right font-medium">R$ 89,90</td>
<td className="py-md px-lg text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
</td>
</tr>
<tr className="hover:bg-background transition-colors">
<td className="py-md px-lg">#TRX-8921</td>
<td className="py-md px-lg font-medium">Ana Oliveira</td>
<td className="py-md px-lg text-on-surface-variant">Yesterday</td>
<td className="py-md px-lg text-right font-medium">R$ 450,00</td>
<td className="py-md px-lg text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
</td>
</tr>
</tbody>
</table>
</section>
</section>

<section className="bg-backgroundest border border-outline-variant rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
<section className="p-lg border-b border-outline-variant flex justify-between items-center">
<h3 className="font-title-lg text-title-lg text-on-background">Upcoming Appointments</h3>
<button className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
<span className="material-symbols-outlined text-[20px]">add</span>
</button>
</section>
<section className="p-lg flex-1 overflow-y-auto space-y-md">

<section className="flex items-start gap-md p-md rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer bg-backgroundest relative overflow-hidden">
<section className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></section>
<section className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
<span className="material-symbols-outlined">vaccines</span>
</section>
<section className="flex-1">
<h4 className="font-label-md text-label-md text-on-background">Vaccination - Rex</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Client: Carlos Mendes</p>
</section>
<section className="text-right shrink-0">
<section className="font-label-md text-label-md text-on-background">14:00</section>
<section className="font-body-sm text-body-sm text-on-surface-variant">Today</section>
</section>
</section>

<section className="flex items-start gap-md p-md rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer bg-backgroundest relative overflow-hidden">
<section className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></section>
<section className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
<span className="material-symbols-outlined">content_cut</span>
</section>
<section className="flex-1">
<h4 className="font-label-md text-label-md text-on-background">Grooming - Luna</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Client: Beatriz Costa</p>
</section>
<section className="text-right shrink-0">
<section className="font-label-md text-label-md text-on-background">15:30</section>
<section className="font-body-sm text-body-sm text-on-surface-variant">Today</section>
</section>
</section>

<section className="flex items-start gap-md p-md rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer bg-backgroundest relative overflow-hidden">
<section className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></section>
<section className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
<span className="material-symbols-outlined">stethoscope</span>
</section>
<section className="flex-1">
<h4 className="font-label-md text-label-md text-on-background">Consultation - Max</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Client: Fernando Silva</p>
</section>
<section className="text-right shrink-0">
<section className="font-label-md text-label-md text-on-background">17:00</section>
<section className="font-body-sm text-body-sm text-on-surface-variant">Today</section>
</section>
</section>
</section>
<section className="p-md border-t border-outline-variant mt-auto">
<button className="w-full py-sm px-md bg-transparent border border-primary text-primary rounded-lg font-label-md hover:bg-primary/5 transition-colors">
                                    View Schedule
                                </button>
</section>
</section>
</section>
</section>

    </>
  );
}

function LayoutGlobalDarkView(props: ReturnType<typeof useLayoutGlobalScreen>) {
  return (
    <>
      
<section className="max-w-[1600px] mx-auto w-full">

<header className="mb-8">
<h2 className="font-headline-md text-headline-md text-on-background">Welcome back, Admin</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Here's what's happening at AgroPet today.</p>
</header>

<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

<section className="bg-background border border-outline-variant rounded-xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-4">
<section className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
</section>
<span className="flex items-center text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                    +12.5%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Daily Revenue</h3>
<section className="font-headline-md text-headline-md text-on-background">R$ 4.250,00</section>
</section>

<section className="bg-background border border-outline-variant rounded-xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-4">
<section className="w-12 h-12 rounded-lg bg-tertiary/15 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
</section>
<span className="flex items-center text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                    +5.2%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Products Sold</h3>
<section className="font-headline-md text-headline-md text-on-background">142</section>
</section>

<section className="bg-background border border-outline-variant rounded-xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-4">
<section className="w-12 h-12 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
</section>
<span className="flex items-center text-sm font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
                                    -2.1%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Appointments Today</h3>
<section className="font-headline-md text-headline-md text-on-background">28</section>
</section>

<section className="bg-background border border-outline-variant rounded-xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300">
<section className="flex justify-between items-start mb-4">
<section className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
</section>
<span className="flex items-center text-sm font-medium text-on-surface-variant bg-surface-variant/40 px-2 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px] mr-1">horizontal_rule</span>
                                    0%
                                </span>
</section>
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">New Pets Registered</h3>
<section className="font-headline-md text-headline-md text-on-background">12</section>
</section>
</section>

<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<section className="lg:col-span-2 bg-background border border-outline-variant rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
<section className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container">
<h3 className="font-headline-md text-headline-md text-on-background">Recent Transactions</h3>
<button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">View All</button>
</section>
<section className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container border-b border-outline-variant">
<th className="py-2 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Transaction ID</th>
<th className="py-2 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Client</th>
<th className="py-2 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
<th className="py-2 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
<th className="py-2 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Status</th>
</tr>
</thead>
<tbody className="font-body-sm text-body-sm text-on-background">
<tr className="border-b border-outline-variant hover:bg-surface-container transition-colors">
<td className="py-4 px-6">#TRX-8923</td>
<td className="py-4 px-6 font-medium">Maria Silva</td>
<td className="py-4 px-6 text-on-surface-variant">Today, 10:45 AM</td>
<td className="py-4 px-6 text-right font-medium">R$ 245,50</td>
<td className="py-4 px-6 text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Completed</span>
</td>
</tr>
<tr className="border-b border-outline-variant hover:bg-surface-container transition-colors">
<td className="py-4 px-6">#TRX-8922</td>
<td className="py-4 px-6 font-medium">João Souza</td>
<td className="py-4 px-6 text-on-surface-variant">Today, 09:30 AM</td>
<td className="py-4 px-6 text-right font-medium">R$ 89,90</td>
<td className="py-4 px-6 text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Completed</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="py-4 px-6">#TRX-8921</td>
<td className="py-4 px-6 font-medium">Ana Oliveira</td>
<td className="py-4 px-6 text-on-surface-variant">Yesterday</td>
<td className="py-4 px-6 text-right font-medium">R$ 450,00</td>
<td className="py-4 px-6 text-center">
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Pending</span>
</td>
</tr>
</tbody>
</table>
</section>
</section>

<section className="bg-background border border-outline-variant rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
<section className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container">
<h3 className="font-headline-md text-headline-md text-on-background">Upcoming Appointments</h3>
<button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
<span className="material-symbols-outlined text-[20px]">add</span>
</button>
</section>
<section className="p-6 flex-1 overflow-y-auto space-y-4">

<section className="flex items-start gap-4 p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer bg-background relative overflow-hidden">
<section className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></section>
<section className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
<span className="material-symbols-outlined">vaccines</span>
</section>
<section className="flex-1">
<h4 className="font-label-md text-label-md text-on-background">Vaccination - Rex</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Client: Carlos Mendes</p>
</section>
<section className="text-right shrink-0">
<section className="font-label-md text-label-md text-on-background">14:00</section>
<section className="font-body-sm text-body-sm text-on-surface-variant">Today</section>
</section>
</section>

<section className="flex items-start gap-4 p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer bg-background relative overflow-hidden">
<section className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></section>
<section className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
<span className="material-symbols-outlined">content_cut</span>
</section>
<section className="flex-1">
<h4 className="font-label-md text-label-md text-on-background">Grooming - Luna</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Client: Beatriz Costa</p>
</section>
<section className="text-right shrink-0">
<section className="font-label-md text-label-md text-on-background">15:30</section>
<section className="font-body-sm text-body-sm text-on-surface-variant">Today</section>
</section>
</section>

<section className="flex items-start gap-4 p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer bg-background relative overflow-hidden">
<section className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></section>
<section className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
<span className="material-symbols-outlined">stethoscope</span>
</section>
<section className="flex-1">
<h4 className="font-label-md text-label-md text-on-background">Consultation - Max</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Client: Fernando Silva</p>
</section>
<section className="text-right shrink-0">
<section className="font-label-md text-label-md text-on-background">17:00</section>
<section className="font-body-sm text-body-sm text-on-surface-variant">Today</section>
</section>
</section>
</section>
<section className="p-4 border-t border-outline-variant mt-auto">
<button className="w-full py-2 px-4 bg-transparent border border-primary text-primary rounded-lg font-label-md hover:bg-primary/10 transition-colors">
                                    View Schedule
                                </button>
</section>
</section>
</section>
</section>

    </>
  );
}
