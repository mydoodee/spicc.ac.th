import Link from "next/link";

const personnel = [
    {
        name: "ดร. สมชาย มุ่งมั่น",
        role: "คณบดีวิทยบริการ",
        description: "เชี่ยวชาญด้านการจัดการศึกษาและนวัตกรรมการเรียนรู้ระดับสากล",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAUFdMETWzuvm2xdilwDq1wiWL9ifdqLAceOSSqpgL8wxPcDAUXX-Z_Q8pUmXMTVrtQraogFnfPaqCfQv8-bslgLBv7JRymlk6ok5f6TyGZDrnBOGQGW371rYOxN9iLBtBPhbgeFKr-8yDMS9duLW-Z0LV6vp8-LUcdO5dC_-STrSvkybwQg73ocmkCETwx5s72XS4yznOueTwoibpIgDhSyX1yLBaVG7Ap860VtoIT-FWedaUafak5lVgp3XXqNxaxWje0ybHlo90",
    },
    {
        name: "ศ.ดร. รัตนา วิจิตร",
        role: "หัวหน้าภาควิชานวัตกรรม",
        description: "ผู้บุกเบิกงานวิจัยด้านเทคโนโลยีสมัยใหม่และ AI เพื่อสังคม",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD_PPk8OtobaOwLlErOAHGoGGYRom6U-FMindP1N6-97ESZgrlS6zA4KGCtvQZcKr6xCPrpWK2IyNBAAv83NPGFY4p69kZRH3ZwXtLvKvgJsTBWkbEpSnR_5h79bW4tln1s0M7UxtGuNhBsAO-9LgquL7m_1qMl6-AWu2TRPFLTAsmq-UTAxJ685wzLIFCArnYSz5qAgQbEDJLAONmolUSkMPK3qdHbkx6AkCmFaWpK7nf_vzBGncrdkIzfsO01jyA11FqVkL68M_A",
    },
    {
        name: "ดร. วิทยา ก้าวไกล",
        role: "อาจารย์ประจำหลักสูตร",
        description: "ผู้เชี่ยวชาญด้านวิทยาศาสตร์ข้อมูลและการวิเคราะห์ชั้นสูง",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA73heruVE5OBka5F5SzWwJdaqcHhQaFK6AEWJZzvf1T9oV43bfPNpIah2BT2vmc7R9IYmlYI9y-l-BNayYx43PoYua-uRrDnCg94uKKz0tEuM6tXTDjladgsEME0oUDrPX-StCNq1oiYThE_5syYeBNo8GqQcV6q-quEwcInzBuOreXmnz09IQtwYdAqkM89iqm_WNW4drpxje0k65lnaPQY1AdWU6t9urETmabQV4l5rTGE6Ki9I86OEhqu1RH57CgVXd2xjcFyA",
    },
    {
        name: "คุณนารี สดใส",
        role: "ผู้อำนวยการฝ่ายกิจการนักศึกษา",
        description: "มุ่งเน้นการพัฒนาทักษะชีวิตและความเป็นผู้นำของนักศึกษา",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBmrIS71LXM2nRulS58XbVgbBG7prn_HZjEX-EfV9H2gcg8Li6wH1tyvgXxJsCPDp3wdimoE1oDxL4m2_IBQDkp8B3dJTr6_s1uaff9B3B8ZaWciHY4zrUq04-ZaZIpZTCe8DCADWX8I3xMrAHIYryL49mUA8A7MoHqS0ZRPxXhCIvCZ_NM4mjLsiRYUZ6fS2ujBe3Dy7zhj2QhS5FkNruGgodqGe3g5u7oltvcIw4i8GijUxmfrI7is3T67PAU4URDGgsBpALEewQ",
    },
];

export default function Stats() {
    return (
        <section id="personnel" className="bg-[#f0f9ff]/50 py-24 relative z-10 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#f2cc0d]/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#2b4a8a]/5 rounded-full blur-3xl -mr-32 -mb-32"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2b4a8a] mb-4">
                        คณะผู้บริหารและคณาจารย์
                    </h2>
                    <div className="w-20 h-1.5 bg-[#f2cc0d] mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {personnel.map((person, index) => (
                        <Link
                            href="#"
                            key={index}
                            className="group block"
                        >
                            <div
                                className="bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b4a8a]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-[#2b4a8a] mb-1 group-hover:text-[#f2cc0d] transition-colors duration-300">
                                        {person.name}
                                    </h4>
                                    <p className="text-[#f2cc0d] font-semibold text-sm mb-3">
                                        {person.role}
                                    </p>
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                        {person.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
