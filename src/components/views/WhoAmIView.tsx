import React from 'react';
import { APP_VERSION_INFO } from '../../config/version';

export const WhoAmIView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 py-4 px-2 sm:px-4 font-body animate-in fade-in duration-300">
      {/* 1. Header Section (Clean & Breathable) */}
      <div className="space-y-2 pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-headline tracking-tight">
          SIAPA AKU
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
          Informasi profil pengembang, arsitektur teknologi, serta status rilis dan distribusi kode platform OSDIGI.
        </p>
      </div>

      {/* 2. Developer & App Profile Section */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-headline">
          PENGEMBANG & ARSITEK SISTEM
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <p className="text-xs text-slate-500">Nama Pengembang</p>
            <p className="text-lg font-bold text-[#0F172A] font-headline">
              {APP_VERSION_INFO.author.name}
            </p>
            <p className="text-xs text-emerald-700 font-semibold pt-0.5">
              {APP_VERSION_INFO.author.role}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-slate-500">Latar Belakang & Almamater</p>
            <p className="text-sm font-semibold text-slate-800">
              {APP_VERSION_INFO.author.background}
            </p>
            <p className="text-xs text-slate-600 font-medium pt-0.5">
              {APP_VERSION_INFO.author.generation}
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-1.5 border-t border-slate-100">
          <p className="text-xs text-slate-500">Mengenai Platform OSDIGI</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            OSDIGI (OSTIFAK Digital Portal) dirancang secara terpadu untuk mendigitalisasi pengelolaan kedisiplinan santri, rekonsiliasi sidang mahkamah kolektif, capaian hafalan Qur'an, manajemen asrama & kelas, penerbitan arahan pimpinan, serta sinkronisasi multi-perangkat waktu-nyata.
          </p>
        </div>
      </div>

      {/* 3. Framework & Tech Stack Section */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-headline">
          FRAMEWORK & TEKNOLOGI
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {APP_VERSION_INFO.techStack.map((stack) => (
            <div key={stack.category} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 font-headline">
                {stack.category}
              </h3>
              <ul className="space-y-1.5">
                {stack.items.map((item) => (
                  <li key={item} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Language Distribution Visual Bar */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-headline">
            DISTRIBUSI BAHASA PEMROGRAMAN
          </h2>
          <span className="text-xs text-slate-500 font-mono">100% Codebase</span>
        </div>

        {/* Multi-Segment Horizontal Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5">
          {APP_VERSION_INFO.languageDistribution.map((item) => (
            <div
              key={item.language}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
              title={`${item.language}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Legend List */}
        <div className="flex flex-wrap gap-5 pt-1">
          {APP_VERSION_INFO.languageDistribution.map((item) => (
            <div key={item.language} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-slate-800">
                {item.language}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Versioning Status Section */}
      <div className="space-y-4 pt-6 pb-8 border-t border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-headline">
          STATUS & VERSI APLIKASI
        </h2>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Versi Saat Ini</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {APP_VERSION_INFO.version}
            </span>
          </div>

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Release Channel</span>
            <span className="font-bold text-emerald-800">
              {APP_VERSION_INFO.channel} RELEASE
            </span>
          </div>

          <div className="h-7 w-px bg-slate-200 hidden sm:block" />

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Waktu Build</span>
            <span className="font-medium text-slate-700">
              {APP_VERSION_INFO.buildDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
