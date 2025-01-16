import Database from '@tauri-apps/plugin-sql';

export interface Category {
	id: string;
	category: string;
	priority: number;
}

export async function getCategories() {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.select('SELECT * FROM categories');
		console.log('GET CATEGORIES: ', result);
	} catch (err) {
		console.error('Error fetching categories: ', err);
		alert('An error occured fetching categories.');
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function getCategory(id: string) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.select('SELECT * FROM categories WHERE id=$1', [id]);
		console.log(`GET CATEGORY ${id}: `, result);
	} catch (err) {
		console.error(`Error fetching category ${id}: `, err);
		alert(`An error occured fetching category ${id}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function addCategory(category: Category) {
	let db;
	let result;
	try {
		console.log(category.category)
		db = await Database.load('sqlite:main.db');
		result = await db.execute(
			"INSERT INTO categories (id, category, priority) VALUES($1, $2, $3);",
			[category.id, category.category, category.priority]
		);
		console.log(`ADD CATEGORY ${category.category}: `, result);
		result = true;
	} catch (err) {
		console.error(`Error adding category ${category.category}: `, err);
		alert(`An error occured adding category ${category.category}.`);
		result = false;
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function deleteCategory(id: string) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute('DELETE FROM categories WHERE id = $1', [id]);
		console.log(`DELETE CATEGORY ${id}: `, result);
		result = true;
	} catch (err) {
		console.error(`Error deleting category ${id}: `, err);
		alert(`An error occured deleting category ${id}.`);
		result = false;
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function updateCategory(category: Category) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute(
			'UPDATE categories SET category=$2, priority=$3 WHERE id=$1',
			[category.id, category.category, category.priority]
		);
		console.log(`UPDATE CATEGORY ${category.id}: `, result);
	} catch (err) {
		console.error(`Error updating category ${category.id}: `, err);
		alert(`An error occured updating category ${category.id}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}
