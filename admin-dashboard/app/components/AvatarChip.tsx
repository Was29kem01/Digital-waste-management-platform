import React from 'react';

export default function AvatarChip({ name, role, branchName }: { name: string, role: string, branchName?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  
  const formatRole = (r: string) => {
    return r.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const displayRole = branchName ? `${formatRole(role)} • ${branchName}` : formatRole(role);

  return (
    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-[#E4DDCE] shadow-xs hover:border-[#2F4B3C]/50 hover:shadow-sm transition-all cursor-pointer select-none">
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-[#21261F] leading-tight font-space">{name}</span>
        <span className="text-[10px] text-[#7A8272] font-semibold leading-tight font-mono mt-0.5">{displayRole}</span>
      </div>
      <div className="w-8 h-8 rounded-lg bg-[#C4693C] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white/20">
        {initials}
      </div>
    </div>
  );
}
