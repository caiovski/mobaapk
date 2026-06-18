export default function DashboardPage() {
  return (
    <div className="flex-1 p-lg flex flex-col gap-gutter bg-background text-on-background max-w-[1600px] mx-auto w-full">
      

<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">

<div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl p-lg shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col gap-md">
<div className="flex justify-between items-start">
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Vendas Hoje (R$)</p>
<div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
</div>
</div>
<div className="flex items-baseline gap-sm">
<h3 className="font-display-lg text-display-lg text-on-surface">R$ 4.250,00</h3>
<span className="font-label-sm text-label-sm text-green-400 bg-green-900/30 px-2 py-1 rounded-full">+12%</span>
</div>
</div>

<div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl p-lg shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col gap-md">
<div className="flex justify-between items-start">
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pedidos Realizados</p>
<div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
</div>
</div>
<div className="flex items-baseline gap-sm">
<h3 className="font-display-lg text-display-lg text-on-surface">42</h3>
<span className="font-label-sm text-label-sm text-green-400 bg-green-900/30 px-2 py-1 rounded-full">+5%</span>
</div>
</div>

<div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl p-lg shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col gap-md">
<div className="flex justify-between items-start">
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Novos Clientes</p>
<div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
</div>
</div>
<div className="flex items-baseline gap-sm">
<h3 className="font-display-lg text-display-lg text-on-surface">8</h3>
<span className="font-label-sm text-label-sm text-red-400 bg-red-900/30 px-2 py-1 rounded-full">-2%</span>
</div>
</div>

<div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl p-lg shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col gap-md">
<div className="flex justify-between items-start">
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Produtos com Estoque Baixo</p>
<div className="w-10 h-10 rounded-full bg-primary-container/15 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
</div>
</div>
<div className="flex items-baseline gap-sm">
<h3 className="font-display-lg text-display-lg text-on-surface">15</h3>
<a className="font-label-sm text-label-sm text-tertiary-container hover:underline ml-auto" href="#">Ver Lista</a>
</div>
</div>
</section>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

<section className="lg:col-span-2 bg-surface-container-lowest dark:bg-surface-container-low rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.04)] border border-outline-variant overflow-hidden flex flex-col">
<div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest dark:bg-surface-container">
<h3 className="font-title-lg text-title-lg text-on-surface">Últimas Vendas</h3>
<button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">Ver todas</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high">
<th className="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ID</th>
<th className="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cliente</th>
<th className="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Data</th>
<th className="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Método de Pagamento</th>
<th className="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total</th>
<th className="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/50">
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">#1042</td>
<td className="p-md font-body-md text-body-md text-on-surface font-medium">João Silva</td>
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">Hoje, 10:30</td>
<td className="p-md">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-teal-900/30 text-teal-400 border border-teal-800">
                                            PIX
                                        </span>
</td>
<td className="p-md font-body-md text-body-md text-on-surface">R$ 150,00</td>
<td className="p-md">
<span className="inline-flex items-center gap-xs text-green-400 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            Concluído
                                        </span>
</td>
</tr>
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">#1041</td>
<td className="p-md font-body-md text-body-md text-on-surface font-medium">Maria Oliveira</td>
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">Hoje, 09:15</td>
<td className="p-md">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-blue-900/30 text-blue-400 border border-blue-800">
                                            Cartão
                                        </span>
</td>
<td className="p-md font-body-md text-body-md text-on-surface">R$ 85,50</td>
<td className="p-md">
<span className="inline-flex items-center gap-xs text-green-400 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            Concluído
                                        </span>
</td>
</tr>
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">#1040</td>
<td className="p-md font-body-md text-body-md text-on-surface font-medium">Carlos Mendes</td>
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">Hoje, 08:45</td>
<td className="p-md">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-yellow-900/30 text-yellow-400 border border-yellow-800">
                                            Dinheiro
                                        </span>
</td>
<td className="p-md font-body-md text-body-md text-on-surface">R$ 45,00</td>
<td className="p-md">
<span className="inline-flex items-center gap-xs text-green-400 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            Concluído
                                        </span>
</td>
</tr>
<tr className="hover:bg-surface-container/50 transition-colors">
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">#1039</td>
<td className="p-md font-body-md text-body-md text-on-surface font-medium">Ana Costa</td>
<td className="p-md font-body-sm text-body-sm text-on-surface-variant">Ontem, 17:20</td>
<td className="p-md">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-teal-900/30 text-teal-400 border border-teal-800">
                                            PIX
                                        </span>
</td>
<td className="p-md font-body-md text-body-md text-on-surface">R$ 210,00</td>
<td className="p-md">
<span className="inline-flex items-center gap-xs text-orange-400 font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">schedule</span>
                                            Pendente
                                        </span>
</td>
</tr>
</tbody>
</table>
</div>
</section>

<aside className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col h-full">
<div className="p-lg border-b border-outline-variant bg-surface-container-lowest dark:bg-surface-container">
<h3 className="font-title-lg text-title-lg text-on-surface">Próximos Banhos/Tosas Hoje</h3>
</div>
<div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">

<div className="flex items-center gap-md p-md rounded-lg border border-outline-variant/50 hover:border-primary/30 hover:shadow-sm transition-all bg-surface-container-lowest dark:bg-surface-container">
<img alt="Dog Avatar" className="w-12 h-12 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS722UEuP1pca7iJW1C3EgUp58RfOxD8LJkyBlFgSD0oPuqirk7ZvXp6YMA8dH3MDDFndsDh_yr-6IF_Hc_vTHryTT6XJ8NtqWiIFui9PTNe2ezGqVEUjfARv0Sg0BAD2VBCSDMvUPbou5wK8fTbFVtU4fAv5pELNz9eg-3vL7HPyBeMSI7T1grIlf0Qk3ATVXUopqGSXQ-EBiwpBC3CdC-SKyy4E8QH7Y9JqvZ9NfMVYaTmDy1Vw2b5_33k9oo2V3CYZraJRcLHG-"/>
<div className="flex-1">
<h4 className="font-label-md text-label-md text-on-surface">Rex (Beagle)</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mt-xs">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                                    11:00 - Banho
                                </p>
</div>
<button className="bg-primary-container text-on-primary-container font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container/90 transition-colors shadow-sm">
                                Iniciar
                            </button>
</div>

<div className="flex items-center gap-md p-md rounded-lg border border-outline-variant/50 hover:border-primary/30 hover:shadow-sm transition-all bg-surface-container-lowest dark:bg-surface-container">
<img alt="Dog Avatar" className="w-12 h-12 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxtP1gL0Ga6j6Z4vWorgPrYpyZEfNX5Cgm9Kws2_qaOBP0q-AmSs0R0pu3fTMV0X50oVlHdI2FvFt2SAQQediGKA2Cct3mR_uC8PoSq4K9ECtoW5njbicwdhxPMS0LPDPi3QYfVlyMZXdBWLarjAeq9LedAV3jTk8fgj14PAukgJqz-sWOz9dQDjpRbtANwRQl8Zq--5bATg2TJz9EHmlg1pGosJ3wHmpPqlBohlW7g-L0zFUywUq6IykMf2fJ_DGVCYZnLDwaTmGl"/>
<div className="flex-1">
<h4 className="font-label-md text-label-md text-on-surface">Bolinha (Lulu)</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mt-xs">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                                    13:30 - Tosa
                                </p>
</div>
<button className="bg-primary-container text-on-primary-container font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container/90 transition-colors shadow-sm">
                                Iniciar
                            </button>
</div>

<div className="flex items-center gap-md p-md rounded-lg border border-outline-variant/50 hover:border-primary/30 hover:shadow-sm transition-all bg-surface-container-lowest dark:bg-surface-container">
<img alt="Dog Avatar" className="w-12 h-12 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqVI0bq4E7cfMJT5DLOrxpfpegsymLWkmovC2CNDLa4CwcOxzmLEjhLikI4iBKifwrPG3psdpU275jyzJhxsc47nWeOapF5ajsgZtxCr2Af7RYUybJeQ4MZeIIHoRmNu_QPzOSR7PoHLBhMhMGcW444JRj7JAGMc9tXYJTsmzM7sUZH3ik118rhFAlnXTHU6SYrD4JgDRUfU9sw9CC9_ntjbMPkiUmBteXGf3pX0VQz0nAs21UGC0yyO_4h1mx9FVJLriGyf1fsVQK"/>
<div className="flex-1">
<h4 className="font-label-md text-label-md text-on-surface">Thor (Golden)</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mt-xs">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                                    15:00 - Banho
                                </p>
</div>
<button className="border border-primary-container text-primary-container font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container/10 transition-colors">
                                Aguardando
                            </button>
</div>
</div>
</aside>
</div>

    </div>
  );
}