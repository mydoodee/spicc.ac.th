"use client";

export default function Features() {
    const features = [
        {
            title: "ความยืดหยุ่น",
            desc: "เรียนรู้ได้ทุกที่ ทุกเวลา ด้วยระบบ E-Learning ที่ทันสมัย",
            icon: "schedule",
        },
        {
            title: "เครือข่ายระดับโลก",
            desc: "เชื่อมโยงกับสถาบันและองค์กรชั้นนำทั่วโลก",
            icon: "public",
        },
        {
            title: "ทุนการศึกษา",
            desc: "สนับสนุนผู้เรียนที่มีศักยภาพด้วยทุนหลากหลายประเภท",
            icon: "verified_user",
        },
        {
            title: "ศูนย์นวัตกรรม",
            desc: "พื้นที่แห่งการสร้างสรรค์ พร้อมอุปกรณ์ระดับมืออาชีพ",
            icon: "smart_toy",
        },
    ];

    return (
        <section className="bg-gradient-to-b from-[#f8f8f5] to-white py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
                {/* Header Section - Centered */}
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                    {/* <span className="text-[#f2cc0d] font-bold tracking-wider uppercase text-sm mb-3 block">
                        WHY CHOOSE US
                    </span> */}
                    <h2 className="text-3xl md:text-5xl font-bold text-[#1a365d] mb-6 leading-tight">
                        ทำไมต้องเลือก <br />

                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        เรามุ่งมั่นที่จะมอบประสบการณ์การเรียนรู้ที่ดีที่สุด
                        เพื่อเตรียมความพร้อมให้คุณก้าวสู่โลกแห่งการทำงานในอนาคตได้อย่างมั่นใจ
                    </p>
                </div>

                {/* Image Section - Centered & Wide */}
                <div className="w-full max-w-5xl mx-auto mb-16 animate-fade-in-up animation-delay-200">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#1a365d]/10 group">
                        <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600"
                            alt="Students talking"
                            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/60 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
                            <p className="text-lg md:text-xl font-medium">บรรยากาศการเรียนรู้ง่ายๆ ที่เป็นกันเอง</p>
                        </div>
                    </div>
                </div>

                {/* Features Grid - Centered 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl animate-fade-in-up animation-delay-400">
                    {features.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-lg shadow-[#1a365d]/5 hover:shadow-xl hover:shadow-[#1a365d]/10 transition-all duration-300 hover:-translate-y-2 border border-slate-100 flex flex-col items-center text-center group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#1a365d]/5 flex items-center justify-center mb-6 group-hover:bg-[#f2cc0d] transition-colors duration-300">
                                <span className="material-icons text-[#1a365d] text-3xl group-hover:text-white transition-colors duration-300">
                                    {item.icon}
                                </span>
                            </div>
                            <h4 className="font-bold text-xl text-[#1a365d] mb-3 group-hover:text-[#f2cc0d] transition-colors duration-300">
                                {item.title}
                            </h4>
                            <p className="text-slate-500 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <button className="mt-16 bg-[#1a365d] hover:bg-[#2c5282] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-[#1a365d]/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group animate-fade-in-up animation-delay-500">
                    รู้จักเราให้มากขึ้น
                    <span className="material-icons group-hover:translate-x-1 transition-transform duration-300">
                        arrow_forward
                    </span>
                </button>
            </div>
        </section>
    );
}
