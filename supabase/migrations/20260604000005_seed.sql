-- Idempotent seed mirroring the current site content, so the live site looks
-- identical once it reads from the database. Runs as the migration (postgres)
-- role, which bypasses RLS.

-- services (names from data/translations.ts, price ranges/icons from data/services.ts)
insert into public.services (slug, name, price, icon, display_order) values
  ('custom_stitching', '{"en":"Custom Stitching","hi":"कस्टम सिलाई","cg":"कस्टम सिलाई"}', '500-5000', 'scissors', 1),
  ('alterations', '{"en":"Alterations","hi":"अल्टरेशन","cg":"अल्टरेशन"}', '100-1500', 'ruler', 2),
  ('bridal_wear', '{"en":"Bridal & Wedding Wear","hi":"ब्राइडल और शादी के कपड़े","cg":"दुलहिन अउ बिहाव के कपड़ा"}', '5000-50000', 'crown', 3),
  ('fabric_sales', '{"en":"Fabric Collection","hi":"कपड़ा संग्रह","cg":"कपड़ा संग्रह"}', '200-2000', 'fabric', 4),
  ('ready_made', '{"en":"Ready-Made Clothing","hi":"रेडीमेड कपड़े","cg":"रेडीमेड कपड़ा"}', '500-5000', 'shirt', 5),
  ('accessories', '{"en":"Accessories","hi":"एक्सेसरीज","cg":"एक्सेसरीज"}', '100-3000', 'sparkles', 6)
on conflict (slug) do nothing;

-- settings singletons (dollar-quoted to avoid escaping the apostrophe / unicode)
insert into public.settings (key, value) values
  ('business_info', $j${"name":"Suhani Boutique","phone":"+917903734532","whatsappNumber":"917903734532","email":"ritik8470@gmail.com","address":{"line1":"DE-60, Indraprasth Colony, Phase-1, Raipura","line2":"Raipur, Chhattisgarh 492013","city":"Raipur","state":"Chhattisgarh","pincode":"492013","country":"India"},"hours":{"time":"11:00 AM – 8:00 PM"},"experience":"20+","coordinates":{"lat":21.2295864,"lng":81.5776114},"mapsUrl":"https://maps.app.goo.gl/pwBq6dzuH7Kh4YMZ6","mapEmbedSrc":"https://www.google.com/maps?q=21.2295864,81.5776114&z=17&output=embed","whatsappGreeting":{"en":"Hi! I'm interested in your tailoring services. Could you help me?","hi":"नमस्ते! मुझे आपकी टेलरिंग सेवाओं में रुचि है। क्या आप मदद कर सकते हैं?","cg":"नमस्ते! मोला तुंहर टेलरिंग सेवा म रुचि हे। का तुमन मदद कर सकथव?"},"fullAddress":"DE-60, Indraprasth Colony, Phase-1, Raipura, Raipur, Chhattisgarh 492013"}$j$),
  ('hero', $j${"image_url":"https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=1920&q=80"}$j$),
  ('announcement', $j${"active":false,"message":{"en":"","hi":"","cg":""}}$j$)
on conflict (key) do nothing;

-- gallery (9 items from data/gallery.ts). Guarded so re-running is a no-op.
insert into public.gallery_images (url, category, alt, display_order)
select v.url, v.category, v.alt, v.display_order from (values
  ('https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=600&h=800&fit=crop&q=80','bridal','Bridal lehenga with intricate embroidery',1),
  ('https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop&q=80','bridal','Wedding saree with gold zari work',2),
  ('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop&q=80','festival','Festive anarkali suit',3),
  ('https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop&q=80','festival','Embroidered kurta set for celebrations',4),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=80','daily','Elegant daily wear salwar kameez',5),
  ('https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop&q=80','daily','Cotton kurti with modern cut',6),
  ('https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop&q=80','alterations','Perfectly altered blouse fitting',7),
  ('https://images.unsplash.com/photo-1606937295547-bc0f668595b3?w=600&h=800&fit=crop&q=80','fabric','Premium silk fabric collection',8),
  ('https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=600&h=800&fit=crop&q=80','fabric','Designer fabric selection',9)
) as v(url, category, alt, display_order)
where not exists (select 1 from public.gallery_images);
