import { googleLoginUrl } from "../api/authApi";

export function LoginPage() {
  return <div className="flex min-h-screen items-center justify-center bg-white px-5">
    <div className="w-full max-w-[318px] rounded-lg border border-[#e3e6e4] px-9 py-8">
      <h1 className="text-center text-[24px] font-semibold tracking-[-.4px] text-[#202124]">Login</h1>
      <button onClick={() => { window.location.href = googleLoginUrl(); }} className="mt-4 flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-[#e3f5eb] text-[11px] text-[#303532] hover:bg-[#d9f0e3]"><span className="font-bold text-[#4285f4]">G</span>Login with Google</button>
      <div className="my-4 flex items-center gap-3 text-[9px] text-[#b0b3b5]"><span className="h-px flex-1 bg-[#e7e9e8]" />or sign up through email<span className="h-px flex-1 bg-[#e7e9e8]" /></div>
      <input disabled placeholder="Email ID" className="mb-2 h-9 w-full rounded-lg bg-[#f4f7f5] px-3 text-[10px] outline-none" />
      <input disabled type="password" placeholder="Password" className="mb-4 h-9 w-full rounded-lg bg-[#f4f7f5] px-3 text-[10px] outline-none" />
      <button disabled className="h-8 w-full rounded-lg bg-[#00a63c] text-[11px] text-white opacity-50">Login</button>
    </div>
  </div>;
}
