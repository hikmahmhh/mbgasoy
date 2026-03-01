import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const seedUsers = [
      { email: "admin@mbgasoy.com", password: "Admin123!", full_name: "Budi Santoso", kitchen_name: "Dapur Sehat Nusantara", role: "admin" },
      { email: "operator1@mbgasoy.com", password: "Operator123!", full_name: "Siti Rahayu", kitchen_name: "", role: "operator" },
      { email: "operator2@mbgasoy.com", password: "Operator123!", full_name: "Ahmad Fauzi", kitchen_name: "", role: "operator" },
    ];

    const results: any[] = [];

    // Create first user (admin) - will auto-create org via handle_new_user trigger
    const { data: adminAuth, error: adminErr } = await admin.auth.admin.createUser({
      email: seedUsers[0].email,
      password: seedUsers[0].password,
      email_confirm: true,
      user_metadata: { full_name: seedUsers[0].full_name, kitchen_name: seedUsers[0].kitchen_name },
    });

    if (adminErr) {
      if (adminErr.message?.includes("already been registered")) {
        results.push({ email: seedUsers[0].email, status: "already exists" });
      } else {
        throw adminErr;
      }
    } else {
      results.push({ email: seedUsers[0].email, status: "created", id: adminAuth.user.id });
    }

    // Get the org created by the admin user
    const { data: adminProfile } = await admin
      .from("profiles")
      .select("current_org_id")
      .eq("user_id", adminAuth?.user?.id || (await getExistingUserId(admin, seedUsers[0].email)))
      .single();

    const orgId = adminProfile?.current_org_id;

    if (!orgId) {
      return new Response(JSON.stringify({ error: "Could not find org for admin user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update org name
    await admin.from("organizations").update({ name: "Dapur Sehat Nusantara" }).eq("id", orgId);

    // Create operator users and add to same org
    for (const u of seedUsers.slice(1)) {
      const { data: authData, error: authErr } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });

      if (authErr) {
        if (authErr.message?.includes("already been registered")) {
          results.push({ email: u.email, status: "already exists" });
          continue;
        }
        results.push({ email: u.email, status: "error", error: authErr.message });
        continue;
      }

      // Add to admin's org
      await admin.from("org_members").insert({ org_id: orgId, user_id: authData.user.id, role: u.role });
      // Update their profile to point to this org
      await admin.from("profiles").update({ current_org_id: orgId }).eq("user_id", authData.user.id);

      results.push({ email: u.email, status: "created", id: authData.user.id });
    }

    // Seed schools
    const schools = [
      { name: "SD Negeri 1 Menteng", address: "Jl. Besuki No.1, Menteng, Jakarta Pusat", student_count: 320, contact_person: "Ibu Dewi", contact_phone: "081234567890", org_id: orgId },
      { name: "SD Negeri 2 Cikini", address: "Jl. Cikini Raya No.45, Jakarta Pusat", student_count: 280, contact_person: "Pak Hendra", contact_phone: "081298765432", org_id: orgId },
      { name: "SMP Negeri 5 Kemayoran", address: "Jl. Garuda No.12, Kemayoran, Jakarta Pusat", student_count: 450, contact_person: "Ibu Lestari", contact_phone: "085611223344", org_id: orgId },
      { name: "SD Islam Terpadu Al-Hikmah", address: "Jl. Pramuka No.88, Jakarta Timur", student_count: 200, contact_person: "Ustadzah Fatimah", contact_phone: "087755443322", org_id: orgId },
      { name: "SDN Gondangdia 01", address: "Jl. RP Soeroso No.20, Gondangdia, Jakarta Pusat", student_count: 350, contact_person: "Pak Surya", contact_phone: "081377889900", org_id: orgId },
    ];

    const { data: schoolData } = await admin.from("schools").upsert(schools, { onConflict: "id" }).select("id, name");

    // Seed menu items
    const menuItems = [
      { name: "Nasi Goreng Spesial", category: "main", description: "Nasi goreng dengan telur, ayam, dan sayuran", calories: 450, protein: 18, carbs: 55, fat: 15, org_id: orgId },
      { name: "Soto Ayam", category: "main", description: "Soto ayam kuning dengan nasi dan pelengkap", calories: 380, protein: 22, carbs: 40, fat: 12, org_id: orgId },
      { name: "Ayam Bakar Madu", category: "main", description: "Ayam bakar dengan saus madu dan nasi", calories: 520, protein: 30, carbs: 45, fat: 20, org_id: orgId },
      { name: "Mie Goreng Sayur", category: "main", description: "Mie goreng dengan aneka sayuran segar", calories: 400, protein: 12, carbs: 58, fat: 14, org_id: orgId },
      { name: "Nasi Uduk Komplit", category: "main", description: "Nasi uduk dengan lauk ayam goreng, tempe, dan sambal", calories: 550, protein: 25, carbs: 60, fat: 22, org_id: orgId },
      { name: "Es Jeruk Segar", category: "drink", description: "Jus jeruk segar tanpa gula tambahan", calories: 80, protein: 1, carbs: 18, fat: 0, org_id: orgId },
      { name: "Susu Coklat", category: "drink", description: "Susu UHT rasa coklat 200ml", calories: 140, protein: 5, carbs: 22, fat: 4, org_id: orgId },
      { name: "Pisang", category: "snack", description: "Pisang ambon segar", calories: 105, protein: 1, carbs: 27, fat: 0, org_id: orgId },
      { name: "Puding Buah", category: "snack", description: "Puding susu dengan potongan buah segar", calories: 120, protein: 3, carbs: 20, fat: 3, org_id: orgId },
    ];

    await admin.from("menu_items").upsert(menuItems, { onConflict: "id" });

    // Seed inventory items
    const inventoryItems = [
      { name: "Beras Premium", category: "grain", unit: "kg", current_stock: 500, min_stock: 100, price_per_unit: 14000, supplier: "PT Beras Sejahtera", org_id: orgId },
      { name: "Ayam Potong", category: "protein", unit: "kg", current_stock: 80, min_stock: 20, price_per_unit: 38000, supplier: "CV Unggas Jaya", org_id: orgId },
      { name: "Telur Ayam", category: "protein", unit: "kg", current_stock: 50, min_stock: 15, price_per_unit: 28000, supplier: "Toko Telur Makmur", org_id: orgId },
      { name: "Minyak Goreng", category: "oil", unit: "liter", current_stock: 60, min_stock: 20, price_per_unit: 18000, supplier: "PT Minyak Nusantara", org_id: orgId },
      { name: "Gula Pasir", category: "other", unit: "kg", current_stock: 30, min_stock: 10, price_per_unit: 16000, supplier: "Toko Sembako Berkah", org_id: orgId },
      { name: "Wortel", category: "vegetable", unit: "kg", current_stock: 25, min_stock: 10, price_per_unit: 12000, supplier: "Pasar Sayur Segar", org_id: orgId },
      { name: "Kentang", category: "vegetable", unit: "kg", current_stock: 40, min_stock: 15, price_per_unit: 15000, supplier: "Pasar Sayur Segar", org_id: orgId },
      { name: "Susu UHT Coklat", category: "other", unit: "pcs", current_stock: 200, min_stock: 50, price_per_unit: 5000, supplier: "PT Susu Sehat", org_id: orgId },
    ];

    await admin.from("inventory_items").upsert(inventoryItems, { onConflict: "id" });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Seed data berhasil dibuat!",
        users: results,
        org_id: orgId,
        credentials: seedUsers.map((u) => ({ email: u.email, password: u.password, role: u.role })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getExistingUserId(admin: any, email: string): Promise<string> {
  const { data } = await admin.rpc("get_user_id_by_email", { _email: email });
  return data;
}
