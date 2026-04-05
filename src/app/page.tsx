import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="box-border h-[100dvh] overflow-hidden bg-[#f6eef2] px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-full w-full items-center justify-center">
        <div className="flex aspect-[390/844] w-full max-w-[390px] flex-col overflow-hidden rounded-[32px] bg-gradient-to-b from-[#a30f4a] via-[#c2185b] to-[#ea4c98] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex h-full flex-col px-5 pb-5 pt-5">
            <section className="flex justify-center pt-1">
              <img
                src="/header.png"
                alt="GREETISIZER"
                className="h-auto w-[250px] max-w-full object-contain"
              />
            </section>

            <section className="mt-5 flex flex-col items-center gap-4">
              <Link
                href="/login"
                className="flex min-h-[58px] w-full max-w-[300px] items-center justify-center rounded-full bg-white px-6 py-4 text-[18px] font-black text-[#111111] shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
              >
                Start creating
              </Link>

              <Link
                href="/my-album"
                className="flex min-h-[58px] w-full max-w-[300px] items-center justify-center rounded-full bg-white/90 px-6 py-4 text-[18px] font-black text-[#b31252] shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
              >
                My Album
              </Link>
            </section>

            <section className="mt-7 flex flex-1 items-start justify-center">
              <div className="relative h-[250px] w-full max-w-[315px]">
                <div className="absolute bottom-[10px] left-1/2 h-[26px] w-[250px] -translate-x-1/2 rounded-full bg-[#8f1d53]/35 blur-[2px]" />

                <div className="absolute bottom-[34px] right-[14px] h-[160px] w-[150px] rotate-[8deg] rounded-[28px] bg-white/92 shadow-[0_20px_44px_rgba(0,0,0,0.16)]" />

                <div className="absolute bottom-[40px] left-[82px] z-20 h-[170px] w-[140px] rounded-[30px] bg-gradient-to-b from-[#ff9fd0] via-[#ff5fa2] to-[#e91e63] shadow-[0_24px_52px_rgba(0,0,0,0.22)]" />

                <div className="absolute bottom-[34px] left-[14px] z-10 h-[160px] w-[160px] -rotate-[6deg] overflow-hidden rounded-[28px] bg-[#dff8ff] shadow-[0_20px_46px_rgba(0,0,0,0.20)]">
                  <div className="absolute -left-6 bottom-[-14px] h-[120px] w-[160px] rounded-full bg-[#32c6de]" />
                  <div className="absolute left-[68px] top-[46px] h-[74px] w-[74px] rounded-full bg-[#12b3cf]/90" />
                  <div className="absolute left-[52px] top-[34px] h-[9px] w-[9px] rotate-45 bg-[#f23f94]" />
                  <div className="absolute left-[78px] top-[78px] h-[7px] w-[7px] rotate-45 bg-[#f46fb0]" />
                  <div className="absolute left-[34px] top-[95px] h-[5px] w-[5px] rotate-45 bg-[#f9a1c8]" />
                </div>
              </div>
            </section>

            <section className="pb-1 text-center">
              <p className="text-[11px] font-semibold text-white/88">
                Powered By Open Ai
              </p>
              <p className="mt-1 text-[11px] font-semibold text-white/88">
                greetisizer.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}