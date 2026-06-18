export default function ProductsPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-lg">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Produtos</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Gerencie seu catálogo de produtos e estoque.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-md w-full md:w-auto">
          
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 font-body-sm text-body-sm text-on-surface bg-surface-container-lowest transition-all" 
              placeholder="Buscar produto..." 
              type="text"
            />
          </div>
          
          <select className="w-full sm:w-auto px-md py-sm rounded-lg border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 font-body-sm text-body-sm text-on-surface bg-surface-container-lowest appearance-none pr-xl relative cursor-pointer">
            <option value="">Todas Categorias</option>
            <option value="racao">Rações</option>
            <option value="medicamento">Medicamentos</option>
            <option value="acessorio">Acessórios</option>
          </select>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-sm bg-[#F97D01] text-white px-md py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container/90 transition-colors shadow-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Produto
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="py-md px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Produto</th>
                <th className="py-md px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Categoria</th>
                <th className="py-md px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Preço</th>
                <th className="py-md px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estoque</th>
                <th className="py-md px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="py-md px-lg">
                  <div className="flex items-center gap-md">
                    <div className="h-12 w-12 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant/50">
                      <img 
                        alt="Ração Premium" 
                        className="w-full h-full object-cover" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxS7NbMBHs0Thl9xbb4rxcWmyiWoGN6HOIlZiuv_5KFekqUJs13hZinxjgAp3tFuYeT0JBeixPBxvezrkS25NBWyOEKcpipBl-yWhOBNqfBLahfeKUXZh1rfFTfXSCj_5lgKPGn6fF-C4MXjbxCfBaqvGfUigGr5nwOR3PiH2dTvkz2c0-_c8DES7fWAEe4r1t_FCWWOMPji4QyD6QgnfxLsS85fzbugT78zkZfA4CHcejpFuo-kCzwGvuzUpTO_v49FtRMi8WCZmw"
                      />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Ração Golden Premier 15kg</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Adultos, Frango e Arroz</p>
                    </div>
                  </div>
                </td>
                <td className="py-md px-lg">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm">
                    Rações
                  </span>
                </td>
                <td className="py-md px-lg font-body-md text-body-md text-on-surface font-medium">R$ 189,90</td>
                <td className="py-md px-lg">
                  <div className="flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                    <span className="font-body-md text-body-md text-on-surface">24 un</span>
                  </div>
                </td>
                <td className="py-md px-lg text-right">
                  <div className="flex justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button className="p-sm text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="py-md px-lg">
                  <div className="flex items-center gap-md">
                    <div className="h-12 w-12 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant/50">
                      <img 
                        alt="Coleira" 
                        className="w-full h-full object-cover" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB9uqObnhqrvoQZFQA0xYy2E8BfpMPHVQsz8cun5SK3Ioyk4w53K4PlS5o-19YMyX52NJa56W1TqFrsrcCoebTvffWQ550XjbkXp6Dba6U8HB9y6KiUmakDQ7A7Tvx6t7KqJ1tIMAoYDFjSNbQ0-oyT_jiOmz_VfbPUr5gkBAjJRPYzZFY6NBOSw9YPm4wUgtgYMScFXTXj6SJlbJnn-FbGIqrIgCP4VrT62jHhkHCcDEIaSEHUK2k4K7gpfJR8dPPxu5MbLVh1ysG"
                      />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Coleira Peitoral Zee.Dog</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Tamanho M, Modelo Skull</p>
                    </div>
                  </div>
                </td>
                <td className="py-md px-lg">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm">
                    Acessórios
                  </span>
                </td>
                <td className="py-md px-lg font-body-md text-body-md text-on-surface font-medium">R$ 125,00</td>
                <td className="py-md px-lg">
                  <div className="flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    <span className="font-body-md text-body-md text-error font-medium">3 un</span>
                  </div>
                </td>
                <td className="py-md px-lg text-right">
                  <div className="flex justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button className="p-sm text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="py-md px-lg">
                  <div className="flex items-center gap-md">
                    <div className="h-12 w-12 rounded-lg bg-surface-variant overflow-hidden flex items-center justify-center border border-outline-variant/50">
                      <span className="material-symbols-outlined text-on-surface-variant">medication</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">Bravecto 10-20kg</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Antipulgas e Carrapatos</p>
                    </div>
                  </div>
                </td>
                <td className="py-md px-lg">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm">
                    Medicamentos
                  </span>
                </td>
                <td className="py-md px-lg font-body-md text-body-md text-on-surface font-medium">R$ 245,50</td>
                <td className="py-md px-lg">
                  <div className="flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                    <span className="font-body-md text-body-md text-on-surface">12 un</span>
                  </div>
                </td>
                <td className="py-md px-lg text-right">
                  <div className="flex justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button className="p-sm text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-lg py-sm border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Mostrando 1 a 3 de 45 produtos</p>
          <div className="flex gap-xs">
            <button className="p-sm rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="p-sm rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
