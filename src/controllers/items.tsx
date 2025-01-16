import Database from '@tauri-apps/plugin-sql';

export interface Item {
	id: string;
	subcategoryid: string;
	priority: number;
	number: string;
	description: string;
	price: number;
}

export async function getItems() {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.select('SELECT * FROM items');
		console.log('GET ITEMS: ', result);
	} catch (err) {
		console.error('Error fetching items: ', err);
		alert('An error occured fetching items.');
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function getItem(id: string) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.select('SELECT * FROM items WHERE id=$1', [id]);
		console.log(`GET ITEM ${id}: `, result);
	} catch (err) {
		console.error(`Error fetching item ${id}: `, err);
		alert(`An error occured fetching item ${id}.`);
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function addItems(item: Item) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute(
			'INSERT into items (id, subcategoryid, priority, number, description, price) VALUES ($1, $2, $3, $4, $5, $6)',
			[item.id, item.subcategoryid, item.priority, item.number, item.description, item.price]
		);
		console.log(`ADD ITEM ${item.description}: `, result);
		result = true;
	} catch (err) {
		console.error(`Error adding item ${item.description}: `, err);
		alert(`An error occured adding item ${item.description}.`);
		result = false;
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function deleteItem(id: string) {
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute('DELETE FROM items WHERE id = $1', [id]);
		console.log(`DELETE ITEM ${id}: `, result);
		result = true;
	} catch (err) {
		console.error(`Error deleting item ${id}: `, err);
		alert(`An error occured deleting item ${id}.`);
		result = false;
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}

export async function updateItem(item: Item) {
	console.log('ITEM', item);
	let db;
	let result;
	try {
		db = await Database.load('sqlite:main.db');
		result = await db.execute(
			'UPDATE items SET subcategoryid=$1, priority=$2, number=$3, description=$4, price=$5 WHERE id=$6',
			[item.subcategoryid, item.priority, item.number, item.description, item.price, item.id]
		);
		console.log(`UPDATE ITEM ${item.id}: `, result);
		result = true;
	} catch (err) {
		console.error(`Error updating item ${item.id}: `, err);
		alert(`An error occured updating item ${item.id}.`);
		result = false;
	} finally {
		if (db) {
			db.close();
		}
		return result;
	}
}
