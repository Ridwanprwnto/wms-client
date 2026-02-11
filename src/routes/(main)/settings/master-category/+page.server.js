// Dummy data sementara - nanti akan diganti dengan API call
let divisiData = [
	{ id: '01', nama: 'Food' },
	{ id: '02', nama: 'Non Food' },
	{ id: '03', nama: 'General Merchandising' },
	{ id: '04', nama: 'Perishable' },
	{ id: '05', nama: 'Counter & Promotion Toad' },
	{ id: '06', nama: 'Electronics' },
	{ id: '07', nama: 'I-Fashion' },
	{ id: '08', nama: 'I-Tech' },
	{ id: '09', nama: 'I-Tronic' }
];

let departemenData = [
    {id: '01', nama: 'Breakfast Food', divisi_id: '01'},
    {id: '02', nama: 'Milk', divisi_id: '01'},
    {id: '03', nama: 'Baby Food', divisi_id: '01'},
    {id: '04', nama: 'Beverages', divisi_id: '01'},
    {id: '05', nama: 'Basic Food', divisi_id: '01'},
    {id: '06', nama: 'Cooking Oil & Margarine', divisi_id: '01'},
    {id: '07', nama: 'Spices & Seasoning', divisi_id: '01'},
    {id: '08', nama: 'Instant Food', divisi_id: '01'},
    {id: '09', nama: 'Snack', divisi_id: '01'},
    {id: '10', nama: 'Canned Food', divisi_id: '01'},
    {id: '11', nama: 'Biscuit', divisi_id: '01'},
    {id: '12', nama: 'Confectionary', divisi_id: '01'},
    {id: '14', nama: 'Tobacco', divisi_id: '01'},
    {id: '13', nama: 'Cosmetic', divisi_id: '02'},
    {id: '15', nama: 'Medicine & Food Supplement', divisi_id: '02'},
    {id: '16', nama: 'Hair Care', divisi_id: '02'},
    {id: '17', nama: 'Oral Care', divisi_id: '02'},
    {id: '18', nama: 'Skincare', divisi_id: '02'},
    {id: '19', nama: 'Body Care', divisi_id: '02'},
    {id: '20', nama: 'Paper Product', divisi_id: '02'},
    {id: '21', nama: 'Detergent & Cleaner', divisi_id: '02'},
    {id: '22', nama: 'Desinfectant & Freshener', divisi_id: '02'},
    {id: '23', nama: 'Electronic & Home Appliances', divisi_id: '03'},
    {id: '24', nama: 'House Hold Non Electric&Hobby', divisi_id: '03'},
    {id: '25', nama: 'Baby Kids Care', divisi_id: '03'},
    {id: '26', nama: 'Clothing, Apparel & Foot Wear', divisi_id: '03'},
    {id: '27', nama: 'Mechanical Tool,Electrical&Gas', divisi_id: '03'},
    {id: '28', nama: 'Diapers', divisi_id: '03'},
    {id: '29', nama: 'Stationary & Special Item', divisi_id: '03'},
    {id: '30', nama: 'Toys & Entertainment', divisi_id: '03'},
    {id: '42', nama: 'Virtual Product, Mobile Ph&Acc', divisi_id: '03'},
    {id: '45', nama: 'Accessories', divisi_id: '03'},
    {id: '47', nama: 'Audio Visual', divisi_id: '03'},
    {id: '48', nama: 'Home Appliances', divisi_id: '03'},
    {id: '31', nama: 'Produce Import', divisi_id: '04'},
    {id: '32', nama: 'Produce Lokal', divisi_id: '04'},
    {id: '33', nama: 'Meat', divisi_id: '04'},
    {id: '34', nama: 'Poultry', divisi_id: '04'},
    {id: '35', nama: 'Fresh Seafood Product', divisi_id: '04'},
    {id: '36', nama: 'Chilled Food', divisi_id: '04'},
    {id: '37', nama: 'Bakery', divisi_id: '04'},
    {id: '41', nama: 'Dairy Food-1', divisi_id: '04'},
    {id: '44', nama: 'Frozen Food-1', divisi_id: '04'},
    {id: '50', nama: 'Delivery Order', divisi_id: '04'},
    {id: '51', nama: 'Frozen Food-2', divisi_id: '04'},
    {id: '52', nama: 'Dairy Food-2', divisi_id: '04'},
    {id: '53', nama: 'Ready To Serve', divisi_id: '04'},
    {id: '39', nama: 'Counter', divisi_id: '05'},
    {id: '40', nama: 'Parcel & Promotion', divisi_id: '05'},
    {id: '43', nama: 'Bakery Production', divisi_id: '05'},
    {id: '49', nama: 'Services Gms', divisi_id: '05'},
    {id: '54', nama: 'Payment Point', divisi_id: '05'},
    {id: '55', nama: 'Ticketing Point', divisi_id: '05'},
    {id: '56', nama: 'Remittance', divisi_id: '05'},
    {id: '57', nama: 'Payment Tools', divisi_id: '05'},
    {id: '58', nama: 'Service', divisi_id: '05'},
    {id: '38', nama: 'Fast Food', divisi_id: '06'},
    {id: '46', nama: 'Ready To Drink', divisi_id: '06'},
    {id: '59', nama: 'Bento Chilled', divisi_id: '06'},
    {id: '60', nama: 'Filled Bread', divisi_id: '06'},
    {id: '61', nama: 'Pasta & Noodle', divisi_id: '06'},
    {id: '62', nama: 'Daily Dessert', divisi_id: '06'},
    {id: '63', nama: 'Frozen Meal', divisi_id: '06'},
    {id: '64', nama: 'Side-Dishes', divisi_id: '06'},
    {id: '65', nama: 'Onigiri', divisi_id: '06'},
    {id: '66', nama: 'Snacking', divisi_id: '06'},
    {id: '67', nama: 'Fresh Cake', divisi_id: '06'},
    {id: '68', nama: 'Soup', divisi_id: '06'},
    {id: '69', nama: 'Steamed Food', divisi_id: '06'},
    {id: '70', nama: 'Pizza', divisi_id: '06'},
    {id: '71', nama: 'Grilled Food', divisi_id: '06'},
    {id: '72', nama: 'Fried Food', divisi_id: '06'},
    {id: '73', nama: 'Supporting Material', divisi_id: '06'},
    {id: '74', nama: 'Prepared Food', divisi_id: '06'},
    {id: 'F1', nama: 'Pakaian Wanita', divisi_id: '07'},
    {id: 'F2', nama: "Women'S Plus Size", divisi_id: '07'},
    {id: 'F3', nama: 'Batik & Kebaya', divisi_id: '07'},
    {id: 'F4', nama: 'Pakaian Muslim Wanita', divisi_id: '07'},
    {id: 'F5', nama: 'Aksesoris Wanita', divisi_id: '07'},
    {id: 'F6', nama: 'Jewelries & Watches', divisi_id: '07'},
    {id: 'F7', nama: "Women'S Bags & Wallet", divisi_id: '07'},
    {id: 'F8', nama: 'Sepatu Wanita', divisi_id: '07'},
    {id: 'F9', nama: 'Maternity', divisi_id: '07'},
    {id: 'FA', nama: 'Underwear & Lingerie', divisi_id: '07'},
    {id: 'FB', nama: 'Sleepwear', divisi_id: '07'},
    {id: 'FC', nama: "Women'S Swimwear", divisi_id: '07'},
    {id: 'FD', nama: 'Activewear', divisi_id: '07'},
    {id: 'FE', nama: "Women'S Customes", divisi_id: '07'},
    {id: 'FF', nama: 'Pakaian Pria', divisi_id: '07'},
    {id: 'FG', nama: "Men'S Plus Size", divisi_id: '07'},
    {id: 'FH', nama: 'Batik', divisi_id: '07'},
    {id: 'FI', nama: 'Pakaian Muslim Pria', divisi_id: '07'},
    {id: 'FJ', nama: 'Aksesoris Pria', divisi_id: '07'},
    {id: 'FK', nama: "Men'S Watches", divisi_id: '07'},
    {id: 'FL', nama: "Men'S Bags & Wallets", divisi_id: '07'},
    {id: 'FM', nama: 'Sepatu Pria', divisi_id: '07'},
    {id: 'FN', nama: "Men'S Swimwear", divisi_id: '07'},
    {id: 'FO', nama: "Men'S Costumes", divisi_id: '07'},
    {id: 'FP', nama: "Girls' Fashion", divisi_id: '07'},
    {id: 'FQ', nama: "Boys' Fashion", divisi_id: '07'},
    {id: 'FR', nama: "Kid'S Swimwear", divisi_id: '07'},
    {id: 'FS', nama: "Kid'S Costumes", divisi_id: '07'},
    {id: 'FT', nama: 'Fashion Ibu & Anak', divisi_id: '07'},
    {id: 'G1', nama: 'Camera & Camcorder', divisi_id: '08'},
    {id: 'G2', nama: 'Camera & Camcorder Accessories', divisi_id: '08'},
    {id: 'G3', nama: 'Computer', divisi_id: '08'},
    {id: 'G4', nama: 'Computer Accessories', divisi_id: '08'},
    {id: 'G5', nama: 'Gadget', divisi_id: '08'},
    {id: 'G6', nama: 'Gadget Accessories', divisi_id: '08'},
    {id: 'G7', nama: 'Gadget & Acc', divisi_id: '08'},
    {id: 'T1', nama: 'Tv', divisi_id: '09'},
    {id: 'T2', nama: 'Home Appliances', divisi_id: '09'},
    {id: 'T3', nama: 'Mp3', divisi_id: '09'},
    {id: 'T4', nama: 'Electronic Personal Care', divisi_id: '09'}
];

let kategoriData = [
	{id: '01', nama: 'Teh Celup', departemen_id: '01'},
    {id: '02', nama: 'Teh Bubuk', departemen_id: '01'},
    {id: '03', nama: 'Breakfast Cereal', departemen_id: '01'},
    {id: '04', nama: 'Cocoa & Creamer', departemen_id: '01'},
    {id: '05', nama: 'Kopi Bubuk/Biji', departemen_id: '01'},
    {id: '06', nama: 'Kopi Instant', departemen_id: '01'},
    {id: '07', nama: 'Jam & Choco Spread', departemen_id: '01'},
    {id: '08', nama: 'Choco Rice', departemen_id: '01'},
    {id: '09', nama: 'Honey', departemen_id: '01'},
    {id: '10', nama: 'Minuman Penghangat', departemen_id: '01'},
    {id: '11', nama: 'Diet Breakfast', departemen_id: '01'},
    {id: '01', nama: 'Susu Kental Manis', departemen_id: '02'},
    {id: '02', nama: 'Instant Milk Powder', departemen_id: '02'},
    {id: '03', nama: 'Regular Milk Powder', departemen_id: '02'},
    {id: '04', nama: 'Evaporated Milk', departemen_id: '02'},
    {id: '05', nama: 'Healthy Milk', departemen_id: '02'},
    {id: '06', nama: 'Susu Ibu Hamil/Menyusui', departemen_id: '02'},
    {id: '07', nama: 'Diet Milk', departemen_id: '02'},
    {id: '01', nama: 'Baby Milk', departemen_id: '03'},
    {id: '02', nama: 'Baby Cereal', departemen_id: '03'},
    {id: '03', nama: 'Baby Biscuit', departemen_id: '03'},
    {id: '04', nama: 'Susu Balita', departemen_id: '03'},
    {id: '01', nama: 'Liquid Milk Tetra', departemen_id: '04'},
    {id: '02', nama: 'Liquid Milk Btl', departemen_id: '04'},
    {id: '03', nama: 'Juice Tetra', departemen_id: '04'},
    {id: '04', nama: 'Liquid Tea', departemen_id: '04'},
    {id: '05', nama: 'Mineral Water', departemen_id: '04'},
    {id: '06', nama: 'Tonic Drink', departemen_id: '04'},
    {id: '07', nama: 'Soft Drink', departemen_id: '04'},
    {id: '08', nama: 'Isotonic', departemen_id: '04'},
    {id: '09', nama: 'Beer', departemen_id: '04'},
    {id: '10', nama: 'Syrup / Concentrate', departemen_id: '04'},
    {id: '11', nama: 'Instant Drink', departemen_id: '04'},
    {id: '12', nama: 'Wine & Spirit (Whisky/Wine)', departemen_id: '04'},
    {id: '13', nama: 'Remedy Drink', departemen_id: '04'},
    {id: '14', nama: 'Liquid Coffee', departemen_id: '04'},
    {id: '15', nama: 'Liquid Milk Yoghurt Drink', departemen_id: '04'},
    {id: '16', nama: 'Juice Botol', departemen_id: '04'},
    {id: '17', nama: 'Mineral Water Galon', departemen_id: '04'},
    {id: '18', nama: 'Natural Water', departemen_id: '04'},
    {id: '19', nama: 'Flavoured Water', departemen_id: '04'},
    {id: '20', nama: 'Alkaline & Other Water', departemen_id: '04'},
    {id: '01', nama: 'Beras', departemen_id: '05'},
    {id: '02', nama: 'Gula (Gula Olahan)', departemen_id: '05'},
    {id: '03', nama: 'Biji-Bijian Lokal', departemen_id: '05'},
    {id: '04', nama: 'Tepung', departemen_id: '05'},
    {id: '06', nama: '-', departemen_id: '05'},
    {id: '01', nama: 'Palm Oil', departemen_id: '06'},
    {id: '02', nama: 'Coconut Oil', departemen_id: '06'},
    {id: '03', nama: 'Seed Oil', departemen_id: '06'},
    {id: '04', nama: 'Butter & Margarine (Non Chilled)', departemen_id: '06'},
    {id: '05', nama: 'Cheese (Non Chilled)', departemen_id: '06'},
    {id: '01', nama: 'Bumbu Masak', departemen_id: '07'},
    {id: '02', nama: 'Bumbu Instant', departemen_id: '07'},
    {id: '03', nama: 'Bumbu Tradisional', departemen_id: '07'},
    {id: '04', nama: 'Tepung Bumbu', departemen_id: '07'},
    {id: '05', nama: 'Kecap', departemen_id: '07'},
    {id: '06', nama: 'Sambal & Sauce Tomat', departemen_id: '07'},
    {id: '07', nama: 'Cooking Sauce', departemen_id: '07'},
    {id: '08', nama: 'Dressing & Mayonnaise', departemen_id: '07'},
    {id: '09', nama: 'Cake Make & Decoration', departemen_id: '07'},
    {id: '01', nama: 'Instant Noodle Pack', departemen_id: '08'},
    {id: '02', nama: 'Instant Noodle Cup', departemen_id: '08'},
    {id: '03', nama: 'Mie Kering', departemen_id: '08'},
    {id: '04', nama: 'Instant Soup', departemen_id: '08'},
    {id: '05', nama: 'Seafood Salted', departemen_id: '08'},
    {id: '06', nama: 'Daging Kering / Abon', departemen_id: '08'},
    {id: '07', nama: 'Kerupuk & Emping Mentah', departemen_id: '08'},
    {id: '08', nama: 'Dry Pasta', departemen_id: '08'},
    {id: '09', nama: 'Ready To Eat', departemen_id: '08'},
    {id: '01', nama: 'Potato Snack', departemen_id: '09'},
    {id: '02', nama: 'Cassava Snack', departemen_id: '09'},
    {id: '03', nama: 'Corn Snack', departemen_id: '09'},
    {id: '04', nama: 'Ekstrudat Snack', departemen_id: '09'},
    {id: '05', nama: 'Seaweed Snack', departemen_id: '09'},
    {id: '06', nama: 'Tempe Snack', departemen_id: '09'},
    {id: '07', nama: 'Others Snack', departemen_id: '09'},
    {id: '08', nama: 'Meat Snack', departemen_id: '09'},
    {id: '09', nama: 'Tradisional Snack', departemen_id: '09'},
    {id: '10', nama: 'Peanuts', departemen_id: '09'},
    {id: '11', nama: 'Preserved Fruit Pack', departemen_id: '09'},
    {id: '01', nama: 'Canned Fruit', departemen_id: '10'},
    {id: '02', nama: 'Canned Vegetable', departemen_id: '10'},
    {id: '03', nama: 'Canned Meat', departemen_id: '10'},
    {id: '04', nama: 'Canned Pork', departemen_id: '10'},
    {id: '05', nama: 'Sardines & Mackerel', departemen_id: '10'},
    {id: '06', nama: 'Canned Seafood', departemen_id: '10'},
    {id: '07', nama: 'Prepared Can Food', departemen_id: '10'},
    {id: '01', nama: 'Biscuit', departemen_id: '11'},
    {id: '02', nama: 'Wafer', departemen_id: '11'},
    {id: '03', nama: 'Sandwich Biscuit', departemen_id: '11'},
    {id: '04', nama: 'Crackers', departemen_id: '11'},
    {id: '05', nama: 'Marie', departemen_id: '11'},
    {id: '06', nama: 'Cookies', departemen_id: '11'},
    {id: '07', nama: 'Cake & Lapis Legit', departemen_id: '11'},
    {id: '08', nama: 'Kue Kering', departemen_id: '11'},
    {id: '09', nama: 'Diet Biscuit', departemen_id: '11'},
    {id: '10', nama: '-', departemen_id: '11'},
    {id: '11', nama: '-', departemen_id: '11'},
    {id: '12', nama: '-', departemen_id: '11'},
    {id: '13', nama: '-', departemen_id: '11'},
    {id: '14', nama: '-', departemen_id: '11'},
    {id: '15', nama: '-', departemen_id: '11'},
    {id: '16', nama: '-', departemen_id: '11'},
    {id: '17', nama: '-', departemen_id: '11'},
    {id: '18', nama: '-', departemen_id: '11'},
    {id: '19', nama: '-', departemen_id: '11'},
    {id: '20', nama: '-', departemen_id: '11'},
    {id: '21', nama: '-', departemen_id: '11'},
    {id: '22', nama: '-', departemen_id: '11'},
    {id: '01', nama: 'Chocolate Bar', departemen_id: '12'},
    {id: '02', nama: 'Chocolate Coated', departemen_id: '12'},
    {id: '03', nama: 'Chocolate Dragees', departemen_id: '12'},
    {id: '04', nama: 'Hard Candies', departemen_id: '12'},
    {id: '05', nama: 'Soft Candies', departemen_id: '12'},
    {id: '06', nama: 'Pastilles', departemen_id: '12'},
    {id: '07', nama: 'Gummy Candies', departemen_id: '12'},
    {id: '08', nama: 'Gum', departemen_id: '12'},
    {id: '09', nama: 'Jelly', departemen_id: '12'},
    {id: '01', nama: 'Sigaret Kretek Tangan (Skt)', departemen_id: '13'},
    {id: '02', nama: 'Sigaret Kretek Mesin (Skm)', departemen_id: '13'},
    {id: '03', nama: 'Sigaret Putih Mesin (Spm)', departemen_id: '13'},
    {id: '04', nama: 'Cigarette Kit', departemen_id: '13'},
    {id: '05', nama: 'Rokok Elektrik (Rel)', departemen_id: '13'}
];

// Auto increment ID helper
let divisiNextId = 5;
let departemenNextId = 7;
let kategoriNextId = 7;

// Helper function untuk generate ID dengan format 2 digit
function generateId(currentId) {
	return String(currentId).padStart(2, '0');
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	// Nanti diganti dengan:
	// const divisi = await getDivisiFromAPI();
	// const departemen = await getDepartemenFromAPI();
	// const kategori = await getKategoriFromAPI();
	
	return {
		divisi: divisiData,
		departemen: departemenData,
		kategori: kategoriData
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	// ============ DIVISI ACTIONS ============
	createDivisi: async ({ request }) => {
		const formData = await request.formData();
		const nama = formData.get('nama');
		
		const newDivisi = {
			id: generateId(divisiNextId++),
			nama: nama
		};
		
		divisiData.push(newDivisi);
		
		// Nanti diganti dengan:
		// await createDivisiAPI(newDivisi);
		
		return { success: true, message: 'Divisi berhasil ditambahkan' };
	},
	
	updateDivisi: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const nama = formData.get('nama');
		
		const index = divisiData.findIndex(item => item.id === id);
		if (index !== -1) {
			divisiData[index].nama = nama;
			
			// Nanti diganti dengan:
			// await updateDivisiAPI(id, { nama });
			
			return { success: true, message: 'Divisi berhasil diupdate' };
		}
		
		return { success: false, message: 'Divisi tidak ditemukan' };
	},
	
	deleteDivisi: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		
		// Check jika divisi memiliki departemen
		const hasDepartemen = departemenData.some(dept => dept.divisi_id === id);
		if (hasDepartemen) {
			return { 
				success: false, 
				message: 'Tidak dapat menghapus divisi yang memiliki departemen' 
			};
		}
		
		divisiData = divisiData.filter(item => item.id !== id);
		
		// Nanti diganti dengan:
		// await deleteDivisiAPI(id);
		
		return { success: true, message: 'Divisi berhasil dihapus' };
	},
	
	// ============ DEPARTEMEN ACTIONS ============
	createDepartemen: async ({ request }) => {
		const formData = await request.formData();
		const nama = formData.get('nama');
		const divisi_id = formData.get('divisi_id');
		
		const newDepartemen = {
			id: generateId(departemenNextId++),
			nama: nama,
			divisi_id: divisi_id
		};
		
		departemenData.push(newDepartemen);
		
		// Nanti diganti dengan:
		// await createDepartemenAPI(newDepartemen);
		
		return { success: true, message: 'Departemen berhasil ditambahkan' };
	},
	
	updateDepartemen: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const nama = formData.get('nama');
		const divisi_id = formData.get('divisi_id');
		
		const index = departemenData.findIndex(item => item.id === id);
		if (index !== -1) {
			departemenData[index].nama = nama;
			departemenData[index].divisi_id = divisi_id;
			
			// Nanti diganti dengan:
			// await updateDepartemenAPI(id, { nama, divisi_id });
			
			return { success: true, message: 'Departemen berhasil diupdate' };
		}
		
		return { success: false, message: 'Departemen tidak ditemukan' };
	},
	
	deleteDepartemen: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		
		// Check jika departemen memiliki kategori
		const hasKategori = kategoriData.some(kat => kat.departemen_id === id);
		if (hasKategori) {
			return { 
				success: false, 
				message: 'Tidak dapat menghapus departemen yang memiliki kategori' 
			};
		}
		
		departemenData = departemenData.filter(item => item.id !== id);
		
		// Nanti diganti dengan:
		// await deleteDepartemenAPI(id);
		
		return { success: true, message: 'Departemen berhasil dihapus' };
	},
	
	// ============ KATEGORI ACTIONS ============
	createKategori: async ({ request }) => {
		const formData = await request.formData();
		const nama = formData.get('nama');
		const departemen_id = formData.get('departemen_id');
		
		const newKategori = {
			id: generateId(kategoriNextId++),
			nama: nama,
			departemen_id: departemen_id
		};
		
		kategoriData.push(newKategori);
		
		// Nanti diganti dengan:
		// await createKategoriAPI(newKategori);
		
		return { success: true, message: 'Kategori berhasil ditambahkan' };
	},
	
	updateKategori: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const nama = formData.get('nama');
		const departemen_id = formData.get('departemen_id');
		
		const index = kategoriData.findIndex(item => item.id === id);
		if (index !== -1) {
			kategoriData[index].nama = nama;
			kategoriData[index].departemen_id = departemen_id;
			
			// Nanti diganti dengan:
			// await updateKategoriAPI(id, { nama, departemen_id });
			
			return { success: true, message: 'Kategori berhasil diupdate' };
		}
		
		return { success: false, message: 'Kategori tidak ditemukan' };
	},
	
	deleteKategori: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		
		kategoriData = kategoriData.filter(item => item.id !== id);
		
		// Nanti diganti dengan:
		// await deleteKategoriAPI(id);
		
		return { success: true, message: 'Kategori berhasil dihapus' };
	}
};