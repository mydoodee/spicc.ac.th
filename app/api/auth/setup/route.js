import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  return await POST();
}

export async function POST() {
  try {
    // 1. Check/Create Admin Users Table & User
    const existingUsersTable = await query(`
      SELECT * FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME || 'wp_spicc2026'}' 
      AND table_name = 'admin_users'
    `);

    if (existingUsersTable.length === 0) {
      await query(`
        CREATE TABLE admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          display_name VARCHAR(100),
          role VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const hashedPassword = await hashPassword('admin1234');
      await query(
        'INSERT INTO admin_users (username, password, display_name, role) VALUES (?, ?, ?, ?)',
        ['devadmin', hashedPassword, 'Developer Admin', 'superadmin']
      );
    } else {
      // Enable creating devadmin if table exists but empty (optional safety)
      const userCheck = await query('SELECT id FROM admin_users WHERE username = "devadmin"');
      if (userCheck.length === 0) {
        const hashedPassword = await hashPassword('admin1234');
        await query(
          'INSERT INTO admin_users (username, password, display_name, role) VALUES (?, ?, ?, ?)',
          ['devadmin', hashedPassword, 'Developer Admin', 'superadmin']
        );
      }
    }

    // 2. Check/Create CMS Menus Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(255),
        page_id INT,
        course_id INT,
        news_id INT,
        parent_id INT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Check/Create CMS Pages Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Check/Create CMS Hero Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_hero (
        id INT AUTO_INCREMENT PRIMARY KEY,
        badge_text VARCHAR(255),
        title_line1 VARCHAR(255),
        title_line2 VARCHAR(255),
        description TEXT,
        bg_image VARCHAR(500),
        show_buttons BOOLEAN DEFAULT true,
        btn_primary_text VARCHAR(100),
        btn_primary_url VARCHAR(255),
        btn_secondary_text VARCHAR(100),
        btn_secondary_url VARCHAR(255),
        bg_opacity FLOAT DEFAULT 0.7,
        bg_fit VARCHAR(20) DEFAULT 'cover',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for Hero table
    try {
      const heroCols = await query(`SHOW COLUMNS FROM cms_hero`);
      const hasOpacity = heroCols.some(col => col.Field === 'bg_opacity');
      const hasFit = heroCols.some(col => col.Field === 'bg_fit');

      if (!hasOpacity) {
        await query(`ALTER TABLE cms_hero ADD COLUMN bg_opacity FLOAT DEFAULT 0.7 AFTER btn_secondary_url`);
      }
      if (!hasFit) {
        await query(`ALTER TABLE cms_hero ADD COLUMN bg_fit VARCHAR(20) DEFAULT 'cover' AFTER bg_opacity`);
      }
    } catch (heroMigError) {
      console.error('Migration error for cms_hero:', heroMigError);
    }

    await query(`
      CREATE TABLE IF NOT EXISTS cms_landing_page (
        id INT AUTO_INCREMENT PRIMARY KEY,
        is_active BOOLEAN DEFAULT false,
        image_url LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for Landing Page if needed (already created with IF NOT EXISTS)

    // --- SEEDING DATA ---

    // Seed Landing Page
    const landing = await query('SELECT id FROM cms_landing_page LIMIT 1');
    if (landing.length === 0) {
      await query(`INSERT INTO cms_landing_page (is_active, image_url) VALUES (0, '')`);
    }

    // Seed Hero Data
    const heroData = await query('SELECT id FROM cms_hero LIMIT 1');
    if (heroData.length === 0) {
      await query(`
        INSERT INTO cms_hero (
          badge_text, title_line1, title_line2, description, bg_image, 
          show_buttons, btn_primary_text, btn_primary_url, btn_secondary_text, btn_secondary_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'เปิดรับสมัครปีการศึกษา 2567 แล้ววันนี้',
        'สร้างอนาคตของคุณที่',
        'วิทยาลัยการอาชีพศีขรภูมิ',
        'ก้าวสู่ความเป็นเลิศทางวิชาการและทักษะแห่งอนาคต ด้วยสภาพแวดล้อมการเรียนรู้ที่ทันสมัยและคณาจารย์ผู้เชี่ยวชาญระดับสากล',
        'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop',
        1,
        'สมัครเรียนออนไลน์', '#',
        'ดูหลักสูตรทั้งหมด', '#'
      ]);
    }

    // Seed Pages
    const pagesToSeed = [
      {
        title: 'เกี่ยวกับเรา',
        slug: 'about-us',
        content: `
            <div class="animate-fade-in-up">
              <span style="color:#f2cc0d; font-weight:bold; letter-spacing:0.05em; text-transform:uppercase; font-size:0.875rem; display:block; margin-bottom:0.75rem;">เกี่ยวกับเรา</span>
              <h2 style="font-size:2.25rem; font-weight:bold; color:#2b4a8a; margin-bottom:1rem; line-height:1.25;">มุ่งมั่นสู่ความเป็นเลิศ<br /><span style="color:#f2cc0d;">พัฒนาศักยภาพไร้ขีดจำกัด</span></h2>
              <p style="color:#475569; font-size:1rem; line-height:1.625; margin-bottom:1.5rem;">วิทยาลัยการอาชีพศีขรภูมิ ก่อตั้งขึ้นด้วยวิสัยทัศน์ที่ต้องการสร้างสภาพแวดล้อมการเรียนรู้ที่ทันสมัยและมีคุณภาพระดับสากล เราเชื่อว่าการศึกษาคือรากฐานสำคัญของการพัฒนาตนเองและสังคม</p>
              <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:1rem; margin-bottom:1.5rem;">
                <div style="text-align:center; padding:1rem; background-color:white; border-radius:0.75rem; box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                  <div style="font-size:1.875rem; font-weight:bold; color:#2b4a8a; margin-bottom:0.25rem;">25+</div>
                  <div style="font-size:0.75rem; color:#475569;">ปีประสบการณ์</div>
                </div>
                <div style="text-align:center; padding:1rem; background-color:white; border-radius:0.75rem; box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                  <div style="font-size:1.875rem; font-weight:bold; color:#2b4a8a; margin-bottom:0.25rem;">100+</div>
                  <div style="font-size:0.75rem; color:#475569;">คณาจารย์</div>
                </div>
                <div style="text-align:center; padding:1rem; background-color:white; border-radius:0.75rem; box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                  <div style="font-size:1.875rem; font-weight:bold; color:#2b4a8a; margin-bottom:0.25rem;">5K+</div>
                  <div style="font-size:0.75rem; color:#475569;">นักศึกษา</div>
                </div>
              </div>
            </div>
          `
      },
      {
        title: 'หลักสูตรที่เปิดสอน',
        slug: 'courses',
        content: `
            <div style="text-align:center; margin-bottom:3rem;">
              <h2 style="font-size:1.875rem; font-weight:bold; color:#2b4a8a; margin-bottom:0.75rem;">หลักสูตรที่เปิดสอน</h2>
              <div style="width:5rem; height:0.25rem; background-color:#f2cc0d; margin-left:auto; margin-right:auto; border-radius:9999px;"></div>
              <p style="margin-top:1rem; color:#475569; max-width:42rem; margin-left:auto; margin-right:auto; font-size:1rem;">หลากหลายสาขาวิชาที่ตอบโจทย์ความต้องการของตลาดโลก พร้อมอุปกรณ์การเรียนที่ทันสมัย</p>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
              <!-- Course 1 -->
              <div style="background-color:#2b4a8a; padding:2rem; border-radius:1rem; color:white; box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <div style="width:3.5rem; height:3.5rem; background-color:rgba(255,255,255,0.2); border-radius:0.75rem; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; font-size:1.875rem;">
                  <span class="material-icons">business_center</span>
                </div>
                <h3 style="font-size:1.125rem; font-weight:bold; margin-bottom:0.75rem;">บริหารธุรกิจและการจัดการ</h3>
                <p style="font-size:0.875rem; opacity:0.9; line-height:1.625;">มุ่งเน้นการสร้างผู้นำธุรกิจยุคใหม่ที่มีวิสัยทัศน์</p>
              </div>
              <!-- Course 2 -->
              <div style="background:linear-gradient(to bottom right, #f2cc0d, #ffd700); padding:2rem; border-radius:1rem; color:#2b4a8a; box-shadow:0 20px 25px -5px rgba(242, 204, 13, 0.4);">
                <div style="width:3.5rem; height:3.5rem; background-color:rgba(255,255,255,0.4); border-radius:0.75rem; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; font-size:1.875rem;">
                  <span class="material-icons">precision_manufacturing</span>
                </div>
                <h3 style="font-size:1.125rem; font-weight:bold; margin-bottom:0.75rem;">วิศวกรรมศาสตร์และเทคโนโลยี</h3>
                <p style="font-size:0.875rem; opacity:0.95; line-height:1.625;">พัฒนานวัตกรรมแห่งอนาคตด้วยเทคโนโลยีล้ำสมัย</p>
              </div>
              <!-- Course 3 -->
              <div style="background-color:white; border:2px solid #e2e8f0; padding:2rem; border-radius:1rem; color:#2b4a8a;">
                <div style="width:3.5rem; height:3.5rem; background-color:rgba(43, 74, 138, 0.1); border-radius:0.75rem; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; font-size:1.875rem;">
                  <span class="material-icons">campaign</span>
                </div>
                <h3 style="font-size:1.125rem; font-weight:bold; margin-bottom:0.75rem;">นิเทศศาสตร์สื่อสารดิจิทัล</h3>
                <p style="font-size:0.875rem; opacity:0.9; line-height:1.625;">สร้างสรรค์คอนเทนต์อย่างมืออาชีพในยุคดิจิทัล</p>
              </div>
            </div>
          `
      },
      {
        title: 'คณะผู้บริหารและคณาจารย์',
        slug: 'personnel',
        content: `
            <div style="text-align:center; mb-20;">
              <h2 style="font-size:2.25rem; font-weight:bold; color:#2b4a8a; margin-bottom:1rem;">คณะผู้บริหารและคณาจารย์</h2>
              <div style="width:6rem; height:0.375rem; background-color:#f2cc0d; margin-left:auto; margin-right:auto; border-radius:9999px;"></div>
              <p style="margin-top:1.5rem; color:#475569; max-width:42rem; margin-left:auto; margin-right:auto; font-size:1.125rem;">ทีมผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมถ่ายทอดความรู้และนวัตกรรมเพื่อส่งเสริมศักยภาพของผู้เรียนอย่างเต็มที่</p>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem; margin-top:3rem;">
              <!-- Person 1 -->
              <div style="background-color:white; border-radius:0.75rem; overflow:hidden; box-shadow:0 20px 25px -5px rgba(43, 74, 138, 0.05); text-align:center;">
                <div style="height:18rem; overflow:hidden; background:#eee;">
                   <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUFdMETWzuvm2xdilwDq1wiWL9ifdqLAceOSSqpgL8wxPcDAUXX-Z_Q8pUmXMTVrtQraogFnfPaqCfQv8-bslgLBv7JRymlk6ok5f6TyGZDrnBOGQGW371rYOxN9iLBtBPhbgeFKr-8yDMS9duLW-Z0LV6vp8-LUcdO5dC_-STrSvkybwQg73ocmkCETwx5s72XS4yznOueTwoibpIgDhSyX1yLBaVG7Ap860VtoIT-FWedaUafak5lVgp3XXqNxaxWje0ybHlo90" style="width:100%; height:100%; object-fit:cover;" />
                </div>
                <div style="padding:1.5rem;">
                  <h4 style="font-size:1.25rem; font-weight:bold; color:#2b4a8a; margin-bottom:0.25rem;">ดร. สมชาย มุ่งมั่น</h4>
                  <p style="color:#f2cc0d; font-weight:500; font-size:0.875rem; margin-bottom:1rem;">คณบดีวิทยบริการ</p>
                  <p style="color:#64748b; font-size:0.875rem; line-height:1.625;">เชี่ยวชาญด้านการจัดการศึกษาและนวัตกรรมการเรียนรู้ระดับสากล</p>
                </div>
              </div>
              <!-- Person 2 -->
              <div style="background-color:white; border-radius:0.75rem; overflow:hidden; box-shadow:0 20px 25px -5px rgba(43, 74, 138, 0.05); text-align:center;">
                <div style="height:18rem; overflow:hidden; background:#eee;">
                   <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_PPk8OtobaOwLlErOAHGoGGYRom6U-FMindP1N6-97ESZgrlS6zA4KGCtvQZcKr6xCPrpWK2IyNBAAv83NPGFY4p69kZRH3ZwXtLvKvgJsTBWkbEpSnR_5h79bW4tln1s0M7UxtGuNhBsAO-9LgquL7m_1qMl6-AWu2TRPFLTAsmq-UTAxJ685wzLIFCArnYSz5qAgQbEDJLAONmolUSpMPK3qdHbkx6AkCmFaWpK7nf_vzBGncrdkIzfsO01jyA11FqVkL68M_A" style="width:100%; height:100%; object-fit:cover;" />
                </div>
                <div style="padding:1.5rem;">
                  <h4 style="font-size:1.25rem; font-weight:bold; color:#2b4a8a; margin-bottom:0.25rem;">ศ.ดร. รัตนา วิจิตร</h4>
                  <p style="color:#f2cc0d; font-weight:500; font-size:0.875rem; margin-bottom:1rem;">หัวหน้าภาควิชานวัตกรรม</p>
                  <p style="color:#64748b; font-size:0.875rem; line-height:1.625;">ผู้บุกเบิกงานวิจัยด้านเทคโนโลยีสมัยใหม่และ AI เพื่อสังคม</p>
                </div>
              </div>
            </div>
          `
      }
    ];

    for (const page of pagesToSeed) {
      const existingPage = await query('SELECT id FROM cms_pages WHERE slug = ? LIMIT 1', [page.slug]);
      if (existingPage.length === 0) {
        await query(
          'INSERT INTO cms_pages (title, slug, content, is_published) VALUES (?, ?, ?, 1)',
          [page.title, page.slug, page.content]
        );
      }
    }

    // Seed Menus
    // Define all default menus we want
    const desiredMenus = [
      { key: 'home', title: 'หน้าแรก', url: '/', page_slug: null, sort_order: 1 },
      { key: 'courses', title: 'หลักสูตร', url: null, page_slug: 'courses', sort_order: 2 },
      { key: 'activity', title: 'กิจกรรม', url: '/news', page_slug: null, sort_order: 3 }, // Updated URL to dedicated page
      { key: 'personnel', title: 'คณาจารย์', url: null, page_slug: 'personnel', sort_order: 4 },
      { key: 'about', title: 'เกี่ยวกับเรา', url: null, page_slug: 'about-us', sort_order: 5 },
      { key: 'contact', title: 'ติดต่อสอบถาม', url: '#contact', page_slug: null, sort_order: 6 },
    ];

    for (const menu of desiredMenus) {
      // Check if menu with this title already exists
      const existing = await query('SELECT id FROM cms_menus WHERE title = ?', [menu.title]);

      if (existing.length === 0) {
        let pageId = null;
        if (menu.page_slug) {
          const page = await query('SELECT id FROM cms_pages WHERE slug = ? LIMIT 1', [menu.page_slug]);
          if (page.length > 0) pageId = page[0].id;
        }

        await query(
          'INSERT INTO cms_menus (title, url, page_id, sort_order, is_active) VALUES (?, ?, ?, ?, 1)',
          [menu.title, menu.url, pageId, menu.sort_order]
        );
      }
    }

    // 5. Check/Create CMS Personnel Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_personnel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        description TEXT,
        department VARCHAR(255) DEFAULT 'ทั่วไป',
        image VARCHAR(500),
        sort_order INT DEFAULT 0,
        is_homepage BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist (MIGRATION)
    try {
      const columns = await query(`SHOW COLUMNS FROM cms_personnel`);
      const hasDepartment = columns.some(col => col.Field === 'department');
      const hasIsHomepage = columns.some(col => col.Field === 'is_homepage');

      if (!hasDepartment) {
        await query(`ALTER TABLE cms_personnel ADD COLUMN department VARCHAR(255) DEFAULT 'ทั่วไป' AFTER description`);
      }
      if (!hasIsHomepage) {
        await query(`ALTER TABLE cms_personnel ADD COLUMN is_homepage BOOLEAN DEFAULT false AFTER sort_order`);
      }
    } catch (colError) {
      console.error('Migration error for cms_personnel:', colError);
    }

    // Seed Personnel Data
    const personnelData = await query('SELECT id FROM cms_personnel LIMIT 1');
    if (personnelData.length === 0) {
      const staff = [
        {
          name: "ดร. สมชาย มุ่งมั่น",
          role: "คณบดีวิทยบริการ",
          desc: "เชี่ยวชาญด้านการจัดการศึกษาและนวัตกรรมการเรียนรู้ระดับสากล",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUFdMETWzuvm2xdilwDq1wiWL9ifdqLAceOSSqpgL8wxPcDAUXX-Z_Q8pUmXMTVrtQraogFnfPaqCfQv8-bslgLBv7JRymlk6ok5f6TyGZDrnBOGQGW371rYOxN9iLBtBPhbgeFKr-8yDMS9duLW-Z0LV6vp8-LUcdO5dC_-STrSvkybwQg73ocmkCETwx5s72XS4yznOueTwoibpIgDhSyX1yLBaVG7Ap860VtoIT-FWedaUafak5lVgp3XXqNxaxWje0ybHlo90",
          order: 1
        },
        {
          name: "ศ.ดร. รัตนา วิจิตร",
          role: "หัวหน้าภาควิชานวัตกรรม",
          desc: "ผู้บุกเบิกงานวิจัยด้านเทคโนโลยีสมัยใหม่และ AI เพื่อสังคม",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_PPk8OtobaOwLlErOAHGoGGYRom6U-FMindP1N6-97ESZgrlS6zA4KGCtvQZcKr6xCPrpWK2IyNBAAv83NPGFY4p69kZRH3ZwXtLvKvgJsTBWkbEpSnR_5h79bW4tln1s0M7UxtGuNhBsAO-9LgquL7m_1qMl6-AWu2TRPFLTAsmq-UTAxJ685wzLIFCArnYSz5qAgQbEDJLAONmolUSkMPK3qdHbkx6AkCmFaWpK7nf_vzBGncrdkIzfsO01jyA11FqVkL68M_A",
          order: 2
        },
        {
          name: "ดร. วิทยา ก้าวไกล",
          role: "อาจารย์ประจำหลักสูตร",
          desc: "ผู้เชี่ยวชาญด้านวิทยาศาสตร์ข้อมูลและการวิเคราะห์ชั้นสูง",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA73heruVE5OBka5F5SzWwJdaqcHhQaFK6AEWJZzvf1T9oV43bfPNpIah2BT2vmc7R9IYmlYI9y-l-BNayYx43PoYua-uRrDnCg94uKKz0tEuM6tXTDjladgsEME0oUDrPX-StCNq1oiYThE_5syYeBNo8GqQcV6q-quEwcInzBuOreXmnz09IQtwYdAqkM89iqm_WNW4drpxje0k65lnaPQY1AdWU6t9urETmabQV4l5rTGE6Ki9I86OEhqu1RH57CgVXd2xjcFyA",
          order: 3
        },
        {
          name: "คุณนารี สดใส",
          role: "ผู้อำนวยการฝ่ายกิจการนักศึกษา",
          desc: "มุ่งเน้นการพัฒนาทักษะชีวิตและความเป็นผู้นำของนักศึกษา",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmrIS71LXM2nRulS58XbVgbBG7prn_HZjEX-EfV9H2gcg8Li6wH1tyvgXxJsCPDp3wdimoE1oDxL4m2_IBQDkp8B3dJTr6_s1uaff9B3B8ZaWciHY4zrUq04-ZaZIpZTCe8DCADWX8I3xMrAHIYryL49mUA8A7MoHqS0ZRPxXhCIvCZ_NM4mjLsiRYUZ6fS2ujBe3Dy7zhj2QhS5FkNruGgodqGe3g5u7oltvcIw4i8GijUxmfrI7is3T67PAU4URDGgsBpALEewQ",
          order: 4
        }
      ];

      for (const p of staff) {
        await query(
          'INSERT INTO cms_personnel (name, role, description, image, sort_order) VALUES (?, ?, ?, ?, ?)',
          [p.name, p.role, p.desc, p.image, p.order]
        );
      }
    }

    // 6. Check/Create CMS News Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        description TEXT,
        date VARCHAR(100),
        category VARCHAR(100),
        image VARCHAR(500),
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed News Data
    const newsData = await query('SELECT id FROM cms_news LIMIT 1');
    if (newsData.length === 0) {
      const newsItems = [
        // Featured News
        {
          title: "พิธีรับประกาศนียบัตร ประจำปีการศึกษา 2566",
          date: "15 พฤศจิกายน 2566",
          description: "ขอแสดงความยินดีกับผู้สำเร็จการศึกษาทุกคนที่มุ่งมั่นตั้งใจ จนประสบความสำเร็จในวันนี้",
          image: "https://images.unsplash.com/photo-1523580494863-6f30312248f5?q=80&w=1920&auto=format&fit=crop",
          category: "Activity",
          is_featured: true
        },
        {
          title: "งานวันก่อตั้งวิทยาลัย ครบรอบ 25 ปี",
          date: "20 ตุลาคม 2566",
          description: "ฉลองครบรอบ 25 ปี แห่งความภาคภูมิใจ พร้อมมุ่งสู่ความเป็นเลิศในทศวรรษหน้า",
          image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1920&auto=format&fit=crop",
          category: "Activity",
          is_featured: true
        },
        {
          title: "โครงการแลกเปลี่ยนนักศึกษาระดับนานาชาติ",
          date: "01 ตุลาคม 2566",
          description: "เปิดโอกาสให้นักศึกษาได้เรียนรู้วัฒนธรรมและประสบการณ์ใหม่ๆ จากต่างประเทศ",
          image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop",
          category: "International",
          is_featured: true
        },
        // General News
        {
          title: "อบรมเชิงปฏิบัติการ: การออกแบบ User Experience",
          date: "12 พ.ย. 2566",
          category: "Workshop",
          description: "เรียนรู้หลักการออกแบบประสบการณ์ผู้ใช้งานอย่างมืออาชีพ พร้อมฝึกปฏิบัติจริง",
          image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
          is_featured: false
        },
        {
          title: "เสวนาพิเศษ: อนาคตของอุตสาหกรรมดิจิทัลในไทย",
          date: "10 พ.ย. 2566",
          category: "Seminar",
          description: "พบกับผู้เชี่ยวชาญชั้นนำมาแลกเปลี่ยนมุมมองเกี่ยวกับทิศทางอุตสาหกรรมดิจิทัล",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
          is_featured: false
        },
        {
          title: "การแข่งขันกีฬาสานสัมพันธ์ 4 สถาบัน",
          date: "05 พ.ย. 2566",
          category: "Sports",
          description: "กิจกรรมกีฬาเพื่อสร้างความสามัคคีและแลกเปลี่ยนประสบการณ์ระหว่างสถาบัน",
          image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
          is_featured: false
        }
      ];

      for (const item of newsItems) {
        await query(
          'INSERT INTO cms_news (title, date, description, image, category, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
          [item.title, item.date, item.description, item.image, item.category, item.is_featured]
        );
      }
    }

    // 7. Check/Create News Section Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_news_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        news_title VARCHAR(255),
        news_description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed News Settings
    const newsSettings = await query('SELECT id FROM cms_news_settings LIMIT 1');
    if (newsSettings.length === 0) {
      await query(
        'INSERT INTO cms_news_settings (news_title, news_description) VALUES (?, ?)',
        ['ข่าวสารและกิจกรรมล่าสุด', 'ติดตามความเคลื่อนไหวและบรรยากาศในรั้ววิทยาลัย']
      );
    }

    // 8. Check/Create Personnel Section Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_personnel_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_title VARCHAR(255),
        personnel_description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed Personnel Settings
    const personnelSettings = await query('SELECT id FROM cms_personnel_settings LIMIT 1');
    if (personnelSettings.length === 0) {
      await query(
        'INSERT INTO cms_personnel_settings (personnel_title, personnel_description) VALUES (?, ?)',
        ['คณะผู้บริหารและคณาจารย์', 'ทีมผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมถ่ายทอดความรู้และนวัตกรรมเพื่อส่งเสริมศักยภาพของผู้เรียนอย่างเต็มที่']
      );
    }

    // 9. Check/Create Courses Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100) DEFAULT 'school',
        color VARCHAR(255) DEFAULT 'bg-[#2b4a8a]',
        text_color VARCHAR(100) DEFAULT 'text-white',
        is_special BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for existing courses table: Add image column if not exists
    try {
      // First attempt to add it if it doesn't exist
      await query(`ALTER TABLE cms_courses ADD COLUMN image LONGTEXT AFTER description`);
    } catch (e) {
      // If it already exists, ensure it is LONGTEXT
      try {
        await query(`ALTER TABLE cms_courses MODIFY COLUMN image LONGTEXT`);
      } catch (modError) {
        console.error('Failed to modify image column:', modError);
      }
    }

    // Migration for is_active column
    try {
      const columns = await query(`SHOW COLUMNS FROM cms_courses`);
      const hasIsActive = columns.some(col => col.Field === 'is_active');
      if (!hasIsActive) {
        await query(`ALTER TABLE cms_courses ADD COLUMN is_active BOOLEAN DEFAULT true AFTER sort_order`);
      }

      // Migration for show_on_home column
      const hasShowOnHome = columns.some(col => col.Field === 'show_on_home');
      if (!hasShowOnHome) {
        await query(`ALTER TABLE cms_courses ADD COLUMN show_on_home BOOLEAN DEFAULT false AFTER is_active`);
      }

      // Migration for slug column
      const hasSlug = columns.some(col => col.Field === 'slug');
      if (!hasSlug) {
        await query(`ALTER TABLE cms_courses ADD COLUMN slug VARCHAR(255) AFTER title`);
      }
    } catch (isActiveError) {
      console.error('Migration error for cms_courses (special columns):', isActiveError);
    }

    // Seed Courses Data
    const coursesData = await query('SELECT id FROM cms_courses LIMIT 1');
    if (coursesData.length === 0) {
      const defaultCourses = [
        { title: "บริหารธุรกิจและการจัดการ", desc: "มุ่งเน้นการสร้างผู้นำธุรกิจยุคใหม่ที่มีวิสัยทัศน์", icon: "business_center", color: "bg-[#2b4a8a]", text_color: "text-white", special: 0 },
        { title: "วิศวกรรมศาสตร์และเทคโนโลยี", desc: "พัฒนานวัตกรรมแห่งอนาคตด้วยเทคโนโลยีล้ำสมัย", icon: "precision_manufacturing", color: "bg-gradient-to-br from-[#f2cc0d] via-[#ffd700] to-[#f2cc0d]", text_color: "text-[#2b4a8a]", special: 1 },
        { title: "นิเทศศาสตร์สื่อสารดิจิทัล", desc: "สร้างสรรค์คอนเทนต์อย่างมืออาชีพในยุคดิจิทัล", icon: "campaign", color: "bg-white", text_color: "text-[#2b4a8a]", special: 0 },
        { title: "การจัดการการท่องเที่ยวและการโรงแรม", desc: "บริการด้วยใจและมาตรฐานระดับสากล", icon: "flight_takeoff", color: "bg-[#e0f2fe]", text_color: "text-[#2b4a8a]", special: 0 }
      ];
      for (let i = 0; i < defaultCourses.length; i++) {
        const c = defaultCourses[i];
        await query(
          'INSERT INTO cms_courses (title, description, icon, color, text_color, is_special, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [c.title, c.desc, c.icon, c.color, c.text_color, c.special, i + 1]
        );
      }
    }

    // 10. Check/Create Courses Section Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_courses_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        courses_title VARCHAR(255),
        courses_description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed Courses Settings
    const coursesSettings = await query('SELECT id FROM cms_courses_settings LIMIT 1');
    if (coursesSettings.length === 0) {
      await query(
        'INSERT INTO cms_courses_settings (courses_title, courses_description) VALUES (?, ?)',
        ['หลักสูตรที่เปิดสอน', 'หลากหลายสาขาวิชาที่ตอบโจทย์ความต้องการของตลาดโลก พร้อมอุปกรณ์การเรียนที่ทันสมัย']
      );
    }

    // 11. Check/Create About Section Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_about_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        title_highlight VARCHAR(255),
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed About Settings
    const aboutSettings = await query('SELECT id FROM cms_about_settings LIMIT 1');
    if (aboutSettings.length === 0) {
      await query(
        'INSERT INTO cms_about_settings (title, title_highlight, description) VALUES (?, ?, ?)',
        [
          'มุ่งมั่นสู่ความเป็นเลิศ',
          'พัฒนาศักยภาพไร้ขีดจำกัด',
          'วิทยาลัยการอาชีพศีขรภูมิ ก่อตั้งขึ้นด้วยวิสัยทัศน์ที่ต้องการสร้างสภาพแวดล้อมการเรียนรู้ที่ทันสมัยและมีคุณภาพระดับสากล เราเชื่อว่าการศึกษาคือรากฐานสำคัญของการพัฒนาตนเองและสังคม'
        ]
      );
    }

    // 12. Check/Create About Features Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_about_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        icon VARCHAR(100) DEFAULT 'verified',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed About Features
    const aboutFeatures = await query('SELECT id FROM cms_about_features LIMIT 1');
    if (aboutFeatures.length === 0) {
      const defaultFeatures = [
        { icon: "verified", title: "มาตรฐานระดับสากล", desc: "หลักสูตรที่ได้รับการรับรองจากองค์กรชั้นนำ" },
        { icon: "psychology", title: "นวัตกรรมการเรียนรู้", desc: "เทคโนโลยีและวิธีการสอนที่ทันสมัย" },
        { icon: "groups", title: "ชุมชนที่แข็งแกร่ง", desc: "เครือข่ายศิษย์เก่าและพันธมิตรทั่วโลก" }
      ];
      for (let i = 0; i < defaultFeatures.length; i++) {
        const f = defaultFeatures[i];
        await query(
          'INSERT INTO cms_about_features (icon, title, description, sort_order) VALUES (?, ?, ?, ?)',
          [f.icon, f.title, f.desc, i + 1]
        );
      }
    }

    // 13. Check/Create About Stats Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_about_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value VARCHAR(50) NOT NULL,
        label VARCHAR(100) NOT NULL,
        sort_order INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed About Stats
    const aboutStats = await query('SELECT id FROM cms_about_stats LIMIT 1');
    if (aboutStats.length === 0) {
      const defaultStats = [
        { value: "25+", label: "ปีประสบการณ์" },
        { value: "100+", label: "คณาจารย์" },
        { value: "5K+", label: "นักศึกษา" }
      ];
      for (let i = 0; i < defaultStats.length; i++) {
        const s = defaultStats[i];
        await query(
          'INSERT INTO cms_about_stats (value, label, sort_order) VALUES (?, ?, ?)',
          [s.value, s.label, i + 1]
        );
      }
    }

    // 14. Check/Create Site Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT '',
        site_logo VARCHAR(100) DEFAULT 'school',
        site_logo_url LONGTEXT,
        site_favicon_url LONGTEXT,
        site_title_suffix VARCHAR(255),
        site_subtitle VARCHAR(255),
        register_link VARCHAR(255) DEFAULT '#',
        register_button_text VARCHAR(100) DEFAULT 'สมัครเรียนเลย',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for site settings columns
    try {
      const columns = await query(`SHOW COLUMNS FROM cms_site_settings`);
      const hasLogoUrl = columns.some(col => col.Field === 'site_logo_url');
      const hasFaviconUrl = columns.some(col => col.Field === 'site_favicon_url');
      const hasTitleSuffix = columns.some(col => col.Field === 'site_title_suffix');
      const hasSubtitle = columns.some(col => col.Field === 'site_subtitle');

      if (!hasLogoUrl) {
        await query(`ALTER TABLE cms_site_settings ADD COLUMN site_logo_url LONGTEXT AFTER site_logo`);
      }
      if (!hasFaviconUrl) {
        await query(`ALTER TABLE cms_site_settings ADD COLUMN site_favicon_url LONGTEXT AFTER site_logo_url`);
      }
      if (!hasTitleSuffix) {
        await query(`ALTER TABLE cms_site_settings ADD COLUMN site_title_suffix VARCHAR(255) AFTER site_favicon_url`);
      }
      if (!hasSubtitle) {
        await query(`ALTER TABLE cms_site_settings ADD COLUMN site_subtitle VARCHAR(255) AFTER site_title_suffix`);
      }
    } catch (migError) {
      console.error('Migration error for cms_site_settings:', migError);
    }

    // 15. Check/Create Footer Settings Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_footer_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT,
        facebook_url VARCHAR(255),
        website_url VARCHAR(255),
        address TEXT,
        phone VARCHAR(100),
        email VARCHAR(255),
        copyright TEXT,
        show_wave BOOLEAN DEFAULT true,
        wave_color VARCHAR(50) DEFAULT '#f8f8f5',
        privacy_policy_url VARCHAR(255) DEFAULT '#',
        terms_of_use_url VARCHAR(255) DEFAULT '#',
        privacy_policy_content LONGTEXT,
        terms_of_use_content LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migration for Footer Settings
    try {
      const footerCols = await query(`SHOW COLUMNS FROM cms_footer_settings`);
      const hasShowWave = footerCols.some(col => col.Field === 'show_wave');
      const hasWaveColor = footerCols.some(col => col.Field === 'wave_color');
      const hasPrivacy = footerCols.some(col => col.Field === 'privacy_policy_url');
      const hasTerms = footerCols.some(col => col.Field === 'terms_of_use_url');
      const hasPrivacyContent = footerCols.some(col => col.Field === 'privacy_policy_content');
      const hasTermsContent = footerCols.some(col => col.Field === 'terms_of_use_content');

      if (!hasShowWave) {
        await query(`ALTER TABLE cms_footer_settings ADD COLUMN show_wave BOOLEAN DEFAULT true AFTER copyright`);
      }
      if (!hasWaveColor) {
        await query(`ALTER TABLE cms_footer_settings ADD COLUMN wave_color VARCHAR(50) DEFAULT '#f8f8f5' AFTER show_wave`);
      }
      if (!hasPrivacy) {
        await query(`ALTER TABLE cms_footer_settings ADD COLUMN privacy_policy_url VARCHAR(255) DEFAULT '#' AFTER wave_color`);
      }
      if (!hasTerms) {
        await query(`ALTER TABLE cms_footer_settings ADD COLUMN terms_of_use_url VARCHAR(255) DEFAULT '#' AFTER privacy_policy_url`);
      }
      if (!hasPrivacyContent) {
        await query(`ALTER TABLE cms_footer_settings ADD COLUMN privacy_policy_content LONGTEXT AFTER terms_of_use_url`);
      }
      if (!hasTermsContent) {
        await query(`ALTER TABLE cms_footer_settings ADD COLUMN terms_of_use_content LONGTEXT AFTER privacy_policy_content`);
      }
    } catch (footerMigError) {
      console.error('Migration error for cms_footer_settings:', footerMigError);
    }

    // Seed Footer Settings
    const footerSettings = await query('SELECT id FROM cms_footer_settings LIMIT 1');
    if (footerSettings.length === 0) {
      await query(`
        INSERT INTO cms_footer_settings (description, facebook_url, website_url, address, phone, email, copyright, show_wave, wave_color, privacy_policy_url, terms_of_use_url, privacy_policy_content, terms_of_use_content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'มุ่งเน้นการสร้างผู้นำที่มีวิสัยทัศน์และทักษะรอบด้าน เพื่อขับเคลื่อนนวัตกรรมสู่สังคมโลก',
        '#',
        '#',
        '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        '02-xxx-xxxx',
        'info@spicc.ac.th',
        '© 2026 วิทยาลัยการอาชีพศีขรภูมิ. All Rights Reserved.',
        1, '#f8f8f5', '#', '#', '', ''
      ]);
    }

    // 16. Check/Create Footer Links Table
    await query(`
      CREATE TABLE IF NOT EXISTS cms_footer_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section VARCHAR(50) NOT NULL, -- 'quick' or 'help'
        title VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed Footer Links
    const footerLinks = await query('SELECT id FROM cms_footer_links LIMIT 1');
    if (footerLinks.length === 0) {
      const defaultLinks = [
        { section: 'quick', title: 'หลักสูตรปริญญาตรี', url: '#' },
        { section: 'quick', title: 'ปฏิทินการศึกษา', url: '#' },
        { section: 'quick', title: 'บริการนักศึกษา', url: '#' },
        { section: 'quick', title: 'รับสมัครงาน', url: '#' },
        { section: 'help', title: 'คำถามที่พบบ่อย', url: '#' },
        { section: 'help', title: 'ติดต่อเจ้าหน้าที่', url: '#' },
        { section: 'help', title: 'รายงานตัวออนไลน์', url: '#' },
        { section: 'help', title: 'ร้องเรียน', url: '#' }
      ];
      for (let i = 0; i < defaultLinks.length; i++) {
        const link = defaultLinks[i];
        await query(
          'INSERT INTO cms_footer_links (section, title, url, sort_order) VALUES (?, ?, ?, ?)',
          [link.section, link.title, link.url, i + 1]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'System setup completed successfully (Hero, Pages, Menus, Users, Personnel, News, Courses, About, Footer).',
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตั้งค่า: ' + error.message },
      { status: 500 }
    );
  }
}
