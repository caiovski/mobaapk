// @ts-nocheck
import { useTheme } from '../../contexts/ThemeContext';
import { useLoginScreen } from './useLoginScreen';

export default function LoginScreen() {
  const { isDark } = useTheme();
  const handlers = useLoginScreen();

  if (isDark) return <LoginDarkView {...handlers} />;
  return <LoginLightView {...handlers} />;
}

function LoginLightView({ email, setEmail, password, setPassword, showPassword, setShowPassword: _setShowPassword, handleLogin }: ReturnType<typeof useLoginScreen>) {
  return (
    <>
      
<main className="flex w-full min-h-screen">

<div className="hidden lg:flex lg:w-1/2 bg-primary-container relative overflow-hidden items-center justify-center p-2xl">
<div className="absolute inset-0 opacity-10 pointer-events-none">

<svg className="w-full h-full" height="100" viewBox="0 0 100 100" width="100" xmlns="http://www.w3.org/2000/svg">
<path d="M25 10c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm50 0c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zM50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zM25 70c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm50 0c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z" fill="currentColor"></path>
</svg>
</div>
<div className="relative z-10 text-center text-white">
<h1 className="font-display-lg text-[48px] leading-tight mb-md">AgroPet</h1>
<p className="text-body-md opacity-90 max-w-[384px] mx-auto">Cuidando de quem você ama com a excelência que o campo e a cidade exigem.</p>
</div>
</div>

<div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-xl bg-surface">
<div className="w-full max-w-[400px]">
<div className="mb-xl">
<h2 className="font-display-lg text-display-lg text-on-surface mb-xs">Bem-vindo de volta</h2>
<p className="font-body-md text-on-surface-variant">Acesse o painel administrativo da AgroPet</p>
</div>
<form action="#" className="space-y-lg" method="POST" onSubmit={handleLogin}>
<div className="space-y-xs">
<label className="font-label-md text-on-surface" htmlFor="email">E-mail</label>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">mail</span>
</div>
<input className="w-full pl-[44px] pr-md py-[12px] bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" id="email" name="email" placeholder="admin@agropet.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
</div>
</div>
<div className="space-y-xs">
<div className="flex items-center justify-between">
<label className="font-label-md text-on-surface" htmlFor="password">Senha</label>
</div>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">lock</span>
</div>
<input className="w-full pl-[44px] pr-md py-[12px] bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
</div>
</div>
<div className="flex items-center justify-between pt-sm">
<div className="flex items-center gap-sm">
<input className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" id="remember-me" name="remember-me" type="checkbox"/>
<label className="font-body-sm text-on-surface-variant" htmlFor="remember-me">Lembrar-me</label>
</div>
<a className="font-label-md text-primary hover:text-on-primary-container transition-colors" href="#">Esqueci minha senha</a>
</div>
<button className="w-full bg-primary-container text-white font-label-md py-[14px] rounded-xl shadow-lg shadow-primary-container/20 hover:bg-on-primary-container hover:shadow-xl transition-all flex items-center justify-center gap-sm mt-xl" type="submit">
                    Entrar no Sistema
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</form>
<div className="mt-2xl text-center">
<p className="font-body-sm text-on-surface-variant/70">
                    © 2024 AgroPet. Todos os direitos reservados.
                </p>
</div>
</div>
</div>
</main>

    </>
  );
}

function LoginDarkView({ email, setEmail, password, setPassword, showPassword, setShowPassword: _setShowPassword, handleLogin }: ReturnType<typeof useLoginScreen>) {
  return (
    <>
      
<main className="flex min-h-screen w-full">

<div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
<div className="relative z-10 text-center p-2xl">
<div className="mb-xl inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
<span className="material-symbols-outlined text-primary text-[48px]">pets</span>
</div>
<h2 className="font-display-lg text-headline-xl text-on-background mb-md">AgroPet Noir</h2>
<p className="font-body-lg text-on-surface-variant max-w-[384px] mx-auto">Gestão premium para o seu negócio pet. Simplicidade, elegância e controle total.</p>
</div>

<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
</div>

<div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-md lg:p-2xl bg-surface-dim relative">
<div className="w-full max-w-[448px]">

<div className="lg:hidden text-center mb-xl">
<h1 className="font-display-lg text-display-lg text-primary">AgroPet</h1>
</div>
<div className="bg-surface-container/40 backdrop-blur-2xl border border-outline-variant/30 rounded-2xl shadow-2xl p-xl lg:p-2xl relative overflow-hidden">

<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
<div className="mb-xl">
<h2 className="font-display-lg text-headline-lg text-on-background mb-xs">Bem-vindo</h2>
<p className="font-body-sm text-on-surface-variant">Acesse sua conta administrativa</p>
</div>
<form action="#" className="space-y-lg" method="POST" onSubmit={handleLogin}>
<div className="space-y-xs">
<label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">E-mail Profissional</label>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">mail</span>
</div>
<input className="w-full pl-[44px] pr-md py-[12px] bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl font-body-md text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none" id="email" name="email" placeholder="admin@agropet.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
</div>
</div>
<div className="space-y-xs">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Senha</label>
</div>
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">lock</span>
</div>
<input className="w-full pl-[44px] pr-md py-[12px] bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl font-body-md text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none" id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
</div>
</div>
<div className="flex items-center justify-between pt-sm">
<div className="flex items-center gap-sm">
<input className="h-4 w-4 bg-surface-container-highest rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-dim" id="remember-me" name="remember-me" type="checkbox"/>
<label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember-me">Lembrar acesso</label>
</div>
<a className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors" href="#">Esqueceu a senha?</a>
</div>
<button className="w-full bg-primary text-on-primary font-label-md text-label-md py-[14px] rounded-xl shadow-lg shadow-primary/10 hover:bg-primary-fixed hover:shadow-primary/20 focus:ring-4 focus:ring-primary/20 transition-all flex items-center justify-center gap-sm mt-xl" type="submit">
            Entrar no Painel
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</form>
</div>
<div className="text-center mt-xl">
<p className="font-body-sm text-body-sm text-on-surface-variant/50">
          © 2024 AgroPet Noir. Todos os direitos reservados.
        </p>
</div>
</div>
</div>
</main>

    </>
  );
}
