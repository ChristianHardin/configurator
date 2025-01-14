import Database from '@tauri-apps/plugin-sql';

export interface Subcategory {
	id: string;
	categoryid: string;
	subcategory: string;
	priority: number;
}

export async function getSubcategories() {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.select('SELECT * FROM subcategories');
		console.log('GET SUBCATEGORIES: ', result);
	} catch (err) {
		console.error('Error fetching subcategories: ', err);
		alert('An error occured fetching subcategories.');
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function getSubcategory(id: string) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.select('SELECT * FROM subcategories WHERE id=$1', [id]);
		console.log(`GET SUBCATEGORY ${id}: `, result);
	} catch (err) {
		console.error(`Error fetching subcategory ${id}: `, err);
		alert(`An error occured fetching subcategory ${id}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function addSubcategory(subcategory: Subcategory) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute(
			'INSERT into subcategories (id, categoryid, subcategory, priority) VALUES ($1, $2, $3, $4)',
			[subcategory.id, subcategory.categoryid, subcategory.subcategory, subcategory.priority]
		);
		console.log(`ADD SUBCATEGORY ${subcategory.subcategory}: `, result);
	} catch (err) {
		console.error(`Error adding subcategory ${subcategory.subcategory}: `, err);
		alert(`An error occured adding subcategory ${subcategory.subcategory}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function deleteSubcategory(id: string) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute('DELETE FROM subcategories WHERE id = $1', [id]);
		console.log(`DELETE SUBCATEGORY ${id}: `, result);
	} catch (err) {
		console.error(`Error deleting subcategory ${id}: `, err);
		alert(`An error occured deleting subcategory ${id}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function updateSubcategory(subcategory: Subcategory) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute(
			'UPDATE subcategories SET subcategory=$1, categoryid=$2, priority=$3 WHERE id=$4',
			[subcategory.subcategory, subcategory.categoryid, subcategory.priority, subcategory.id]
		);
		console.log(`UPDATE SUBCATEGORY ${subcategory.id}: `, result);
	} catch (err) {
		console.error(`Error updating subcategory ${subcategory.id}: `, err);
		alert(`An error occured updating subcategory ${subcategory.id}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}
