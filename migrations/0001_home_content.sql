PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  storage_key TEXT,
  public_url TEXT,
  content_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  CHECK (storage_key IS NOT NULL OR public_url IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS home_hero_translations (
  locale TEXT PRIMARY KEY CHECK (locale IN ('en', 'cn', 'id')),
  kicker TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS home_section_translations (
  section_key TEXT NOT NULL CHECK (section_key IN ('products', 'about')),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn', 'id')),
  title TEXT NOT NULL,
  subtitle TEXT,
  PRIMARY KEY (section_key, locale)
);

CREATE TABLE IF NOT EXISTS home_slides (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media_assets(id),
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_slide_translations (
  slide_id TEXT NOT NULL REFERENCES home_slides(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn', 'id')),
  alt_text TEXT NOT NULL,
  PRIMARY KEY (slide_id, locale)
);

CREATE TABLE IF NOT EXISTS product_series (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_series_translations (
  series_id TEXT NOT NULL REFERENCES product_series(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn', 'id')),
  title TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (series_id, locale)
);

CREATE TABLE IF NOT EXISTS product_series_images (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES product_series(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_assets(id),
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS product_series_image_translations (
  series_image_id TEXT NOT NULL REFERENCES product_series_images(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn', 'id')),
  alt_text TEXT NOT NULL,
  PRIMARY KEY (series_image_id, locale)
);

CREATE TABLE IF NOT EXISTS about_blocks (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media_assets(id),
  image_position TEXT NOT NULL CHECK (image_position IN ('left', 'right')),
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS about_block_translations (
  block_id TEXT NOT NULL REFERENCES about_blocks(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'cn', 'id')),
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  image_alt TEXT NOT NULL,
  PRIMARY KEY (block_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_home_slides_published ON home_slides(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_series_published ON product_series(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_series_images_order ON product_series_images(series_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_about_blocks_published ON about_blocks(status, sort_order);

INSERT INTO media_assets (id, public_url, content_type) VALUES
  ('media-slide-cat-1', '/assets/slider/catScratch1.jpg', 'image/jpeg'),
  ('media-slide-cat-2', '/assets/slider/catScratch2.jpg', 'image/jpeg'),
  ('media-slide-wall-2', '/assets/slider/wallPaper2.png', 'image/png'),
  ('media-wall-1', '/assets/products/wallpaper/wallPaper1.png', 'image/png'),
  ('media-wall-2', '/assets/products/wallpaper/wallPaper2.png', 'image/png'),
  ('media-wall-3', '/assets/products/wallpaper/Wallpaper3.png', 'image/png'),
  ('media-wall-4', '/assets/products/wallpaper/Wallpaper4.png', 'image/png'),
  ('media-cat-0', '/assets/products/catscratch/catScratch0.png', 'image/png'),
  ('media-floor-1', '/assets/products/floorpaper/floorpaper1.jpg', 'image/jpeg'),
  ('media-floor-2', '/assets/products/floorpaper/floorpaper2.jpg', 'image/jpeg');

INSERT INTO home_hero_translations (locale, kicker, title, description, cta_label) VALUES
  ('en', 'Curated Interior Collection', 'Design Better Corners for Everyday Living', 'From wall decals to scratch-friendly pads and floor tiles, we deliver practical products with a clean modern style.', 'Explore Products'),
  ('cn', '精选家居系列', '让每个角落都更舒适、更有质感', '从墙贴、猫抓板到免胶地贴，我们提供兼具实用性与现代风格的家居装饰产品。', '查看产品'),
  ('id', 'Koleksi Interior Pilihan', 'Wujudkan Sudut Rumah yang Lebih Nyaman', 'Dari wall decal, cat scratching pad, hingga lantai tempel, kami menghadirkan produk praktis dengan gaya modern yang bersih.', 'Lihat Produk');

INSERT INTO home_section_translations (section_key, locale, title, subtitle) VALUES
  ('products', 'en', 'Featured Products', 'Flexible home improvement products built for apartment-friendly upgrades.'),
  ('products', 'cn', '热门产品', '适合公寓与家庭场景的快速焕新方案，安装便捷，维护简单。'),
  ('products', 'id', 'Produk Unggulan', 'Solusi dekorasi rumah yang fleksibel dan mudah dipasang untuk hunian modern.'),
  ('about', 'en', 'About Neospace', NULL),
  ('about', 'cn', '关于 Neospace', NULL),
  ('about', 'id', 'Tentang Neospace', NULL);

INSERT INTO home_slides (id, media_id, sort_order) VALUES
  ('slide-1', 'media-slide-cat-1', 10),
  ('slide-2', 'media-slide-cat-2', 20),
  ('slide-3', 'media-slide-wall-2', 30);

INSERT INTO home_slide_translations (slide_id, locale, alt_text) VALUES
  ('slide-1', 'en', 'Cat scratching product'), ('slide-1', 'cn', '猫抓板产品展示'), ('slide-1', 'id', 'Produk cat scratching'),
  ('slide-2', 'en', 'Wall decoration setup'), ('slide-2', 'cn', '家居装饰展示'), ('slide-2', 'id', 'Produk dekorasi dinding'),
  ('slide-3', 'en', 'Modern wallpaper collection'), ('slide-3', 'cn', '现代墙贴系列'), ('slide-3', 'id', 'Koleksi wallpaper modern');

INSERT INTO product_series (id, sort_order) VALUES
  ('series-wall-decals', 10),
  ('series-cat-scratch', 20),
  ('series-floor-tiles', 30);

INSERT INTO product_series_translations (series_id, locale, title, description) VALUES
  ('series-wall-decals', 'en', 'Wall Decals', NULL), ('series-wall-decals', 'cn', '墙贴系列', NULL), ('series-wall-decals', 'id', 'Wall Decals', NULL),
  ('series-cat-scratch', 'en', 'Cat Scratching Pad', NULL), ('series-cat-scratch', 'cn', '猫抓板', NULL), ('series-cat-scratch', 'id', 'Cat Scratching Pad', NULL),
  ('series-floor-tiles', 'en', 'Peel & Stick Floor Tiles', NULL), ('series-floor-tiles', 'cn', '免胶地贴', NULL), ('series-floor-tiles', 'id', 'Peel & Stick Floor Tiles', NULL);

INSERT INTO product_series_images (id, series_id, media_id, sort_order) VALUES
  ('series-wall-image-1', 'series-wall-decals', 'media-wall-1', 10),
  ('series-wall-image-2', 'series-wall-decals', 'media-wall-2', 20),
  ('series-wall-image-3', 'series-wall-decals', 'media-wall-3', 30),
  ('series-wall-image-4', 'series-wall-decals', 'media-wall-4', 40),
  ('series-cat-image-1', 'series-cat-scratch', 'media-cat-0', 10),
  ('series-floor-image-1', 'series-floor-tiles', 'media-floor-1', 10),
  ('series-floor-image-2', 'series-floor-tiles', 'media-floor-2', 20);

INSERT INTO product_series_image_translations (series_image_id, locale, alt_text) VALUES
  ('series-wall-image-1', 'en', 'Wall decal model 1'), ('series-wall-image-1', 'cn', '墙贴款式1'), ('series-wall-image-1', 'id', 'Wall decal model 1'),
  ('series-wall-image-2', 'en', 'Wall decal model 2'), ('series-wall-image-2', 'cn', '墙贴款式2'), ('series-wall-image-2', 'id', 'Wall decal model 2'),
  ('series-wall-image-3', 'en', 'Wall decal model 3'), ('series-wall-image-3', 'cn', '墙贴款式3'), ('series-wall-image-3', 'id', 'Wall decal model 3'),
  ('series-wall-image-4', 'en', 'Wall decal model 4'), ('series-wall-image-4', 'cn', '墙贴款式4'), ('series-wall-image-4', 'id', 'Wall decal model 4'),
  ('series-cat-image-1', 'en', 'Cat scratching pad'), ('series-cat-image-1', 'cn', '猫抓板'), ('series-cat-image-1', 'id', 'Cat scratching pad'),
  ('series-floor-image-1', 'en', 'Floor tile model 1'), ('series-floor-image-1', 'cn', '地贴款式1'), ('series-floor-image-1', 'id', 'Floor tile model 1'),
  ('series-floor-image-2', 'en', 'Floor tile model 2'), ('series-floor-image-2', 'cn', '地贴款式2'), ('series-floor-image-2', 'id', 'Floor tile model 2');

INSERT INTO about_blocks (id, media_id, image_position, sort_order) VALUES
  ('about-idea', 'media-slide-wall-2', 'right', 10),
  ('about-making', 'media-slide-cat-2', 'left', 20),
  ('about-result', 'media-slide-cat-1', 'right', 30);

INSERT INTO about_block_translations (block_id, locale, eyebrow, title, body, tags_json, image_alt) VALUES
  ('about-idea', 'en', '01 / THE IDEA', 'Better details for everyday spaces.', 'Neospace Decor looks at the small surfaces that shape how a room feels, then makes them easier to refresh with a clean and practical approach.', '["Flexible","Easy to live with"]', 'Modern wall decoration in a bright interior'),
  ('about-making', 'en', '02 / THE MAKING', 'Practical products, considered from every angle.', 'From materials to everyday handling, each collection is shaped around simple installation, lasting use, and a finish that fits naturally into the home.', '["Thoughtful materials","Everyday ready"]', 'Neospace Decor product detail in use'),
  ('about-result', 'en', '03 / THE RESULT', 'Small changes can reshape a whole corner.', 'Our collections help people make a space feel more personal without turning an update into a complicated project.', '["Personal spaces","Simple updates"]', 'Cat scratching product displayed in a home'),
  ('about-idea', 'cn', '01 / 品牌理念', '为每一个日常角落，增添更好的细节。', 'Neospace Decor 关注那些影响空间感受的细小表面，以简洁、实用的方式，让家居焕新变得更轻松。', '["灵活搭配","易于日常使用"]', '明亮室内空间中的现代墙面装饰'),
  ('about-making', 'cn', '02 / 产品构思', '从每个角度考虑实用与美感。', '从材料选择到日常使用，每个系列都围绕便捷安装、长久使用，以及自然融入居住空间的外观而设计。', '["用心选材","适合日常"]', 'Neospace Decor 产品细节展示'),
  ('about-result', 'cn', '03 / 空间变化', '微小改变，也能重新定义一个角落。', '我们的产品系列帮助人们塑造更有个人感的空间，无需将一次焕新变成复杂的工程。', '["个性空间","轻松焕新"]', '家居场景中的猫抓板产品展示'),
  ('about-idea', 'id', '01 / GAGASAN', 'Detail yang lebih baik untuk ruang sehari-hari.', 'Neospace Decor memperhatikan permukaan kecil yang membentuk suasana ruang, lalu menjadikannya lebih mudah diperbarui lewat pendekatan yang bersih dan praktis.', '["Fleksibel","Nyaman digunakan"]', 'Dekorasi dinding modern di interior yang terang'),
  ('about-making', 'id', '02 / PROSES', 'Produk praktis yang dipikirkan dari setiap sisi.', 'Dari bahan hingga cara penggunaan sehari-hari, setiap koleksi dirancang untuk pemasangan sederhana, pemakaian tahan lama, dan tampilan yang menyatu dengan rumah.', '["Bahan pilihan","Siap untuk sehari-hari"]', 'Detail produk Neospace Decor saat digunakan'),
  ('about-result', 'id', '03 / HASIL', 'Perubahan kecil dapat membentuk ulang satu sudut ruang.', 'Koleksi kami membantu orang membuat ruang terasa lebih personal tanpa menjadikan pembaruan rumah sebagai proyek yang rumit.', '["Ruang personal","Pembaruan sederhana"]', 'Produk cat scratching di dalam rumah');
