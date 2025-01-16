import * as React from 'react';
import * as Subcategory from '../controllers/subcategories.tsx';
import * as Category from '../controllers/categories.tsx';
import * as Item from '../controllers/items.tsx'
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from '@mui/material/';
import {
	GridRowModesModel,
	GridRowModes,
	DataGrid,
	GridColDef,
	GridToolbarContainer,
	GridActionsCellItem,
	GridEventListener,
	GridRowId,
	GridRowEditStopReasons,
	useGridApiRef,
} from '@mui/x-data-grid';


function CategoryTable() {
	const [loading, setLoading] = React.useState(true);

	// Rows ======================================================
	const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
	const [subcategoryMap, setSubcategoryMap] = React.useState<Map<string, string>>(new Map());
	const [reversedSubcategoryMap, setReversedSubcategoryMap] = React.useState<Map<string, string>>(new Map());
	const [subcategoryNames, setSubcategoryNames] = React.useState<string[]>([]);
	const [hasRun, setHasRun] = React.useState(false);
	const apiRef = useGridApiRef();

	React.useEffect(() => {
		if (hasRun) return;
		setHasRun(true);

		const newMap = new Map<string, string>();
		const newNames: string[] = [];
		const newSubcategories: Subcategory.Subcategory[] = [];
		Subcategory.getSubcategories().then((result: any) => {
			result.forEach((element: any) => {
				newMap.set(element.id, element.subcategory);
				newNames.push(element.subcategory);
				newSubcategories.push({
					id: element.id,
					categoryid: element.categoryid,
					subcategory: element.category,
					priority: element.priority
				})
			});

			setSubcategoryNames(newNames);
			setSubcategoryMap(newMap);
		});
	}, [hasRun]);

	React.useEffect(() => {
		const newMap = new Map<string, string>();
		subcategoryMap.forEach((value, key) => {
			newMap.set(value, key);
		});
		setReversedSubcategoryMap(newMap);

		Item.getItems().then((result: any) => {
			result.forEach((element: Item.Item) => {
				const newItem: any = {
					id: element.id,
					subcategoryid: element.subcategoryid,
					subcategory: subcategoryMap.get(element.subcategoryid),
					priority: element.priority,
					number: element.number,
					description: element.description,
					price: element.price,
				};
				if (apiRef.current) apiRef.current.updateRows([newItem]);
			});
			setLoading(false);
		});
	}, [subcategoryMap]);

	// Add Record Button =========================================
	function EditToolbar() {
		const handleClick = () => {
			const newCategory: any = {
				id: uuidv4(),
				subcategoryid: '',
				subcategory: '',
				number: '',
				priority: 0,
				description: '',
				price: 0,
				isNew: true,
			}
			if (apiRef.current) apiRef.current.updateRows([newCategory]);
			setRowModesModel({ ...rowModesModel, [newCategory.id]: { mode: GridRowModes.Edit, fieldToFocus: 'subcategory' } });
		}

		return (
			<GridToolbarContainer>
				<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
					Add record
				</Button>
			</GridToolbarContainer>
		);
	}

	// Handle clicks ===========================================
	const handleSaveClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	}

	const handleCancelClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true }, });

		if (apiRef.current) {
			const editedRow = apiRef.current.getRow(id);
			if (editedRow!.isNew) {
				apiRef.current.updateRows([{ id: id, _action: 'delete' }]);
			}
		} else {
			console.error('apiRef is null.')
			alert('An error has occured, reload the page.')
		}
	}

	const handleEditClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	}

	const handleDeleteClick = (id: any) => () => {
		// TO DO: Add delete warning (cascade delete);
		Subcategory.deleteSubcategory(id).then((result: any) => {
			if (result) {
				if (apiRef.current) apiRef.current.updateRows([{ id: id, _action: 'delete' }]);
			} else { }
		});
	}

	const processRowUpdate = (newRow: any) => {
		const itemCategory: string = newRow.subcategory;
		let newItem: Item.Item;
		if (itemCategory && reversedSubcategoryMap.has(itemCategory)) {
			const subcategoryid = reversedSubcategoryMap.get(itemCategory);

			if (subcategoryid) {
				newItem = {
					id: newRow.id,
					subcategoryid: subcategoryid,
					priority: Number(newRow.priority),
					description: newRow.description,
					number: newRow.number,
					price: Number(newRow.price),
				}

				if (newRow.isNew) {
					Item.addItems(newItem).then((result: any) => {
						if (result) {
							if (apiRef.current) apiRef.current.updateRows([{ ...newItem, isNew: false, subcategory: newRow.subcategory }]);
						} else { }
					});
					return { ...newItem, isNew: false, subcategory: newRow.subcategory };
				} else {
					console.log('update', newItem);
					Item.updateItem(newItem).then((result: any) => {
						if (result) {
							if (apiRef.current) apiRef.current.updateRows([{ ...newItem, isNew: false, subcategory: newRow.subcategory }]);
						} else { }
					});
					return { ...newItem, isNew: false, subcategory: newRow.subcategory };
				}
			} else {
				alert('Subcategory not found. Are you sure the category exists?');
			}
		} else {
			alert("Subcategory not found. Are you sure the category exists?");
		}
	};

	const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
		if (params.reason === GridRowEditStopReasons.rowFocusOut) {
			event.defaultMuiPrevented = true;
		}
	};


	// Columns ===================================================

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	});

	const columns: GridColDef[] = [
		{
			field: 'id',
			headerName: 'ID (Pre-generated)',
			type: 'string',
			width: 300,
		},
		{
			field: 'subcategory',
			headerName: 'Subcategory',
			editable: true,
			type: 'singleSelect',
			width: 150,
			valueOptions: [...subcategoryNames]
		},
		{
			field: 'number',
			headerName: 'Part #',
			editable: true,
			width: 100,
		},
		{
			field: 'description',
			headerName: 'Description',
			editable: true,
			width: 300,
		},
		{
			field: 'price',
			headerName: 'Price',
			type: 'number',
			editable: true,
			valueFormatter: (value) => currencyFormatter.format(Number(value)),
			width: 100,
		},
		{
			field: 'priority',
			headerName: 'Priority',
			type: 'number',
			editable: true,
			width: 100,
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Actions',
			width: 100,
			cellClassName: 'actions',
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

				if (isInEditMode) {
					return [
						<GridActionsCellItem
							icon={<SaveIcon />}
							label="Save"
							sx={{
								color: 'primary.main',
							}}
							onClick={handleSaveClick(id)}
						/>,
						<GridActionsCellItem
							icon={<CancelIcon />}
							label="Cancel"
							className="textPrimary"
							onClick={handleCancelClick(id)}
							color="inherit"
						/>,
					];
				}

				return [
					<GridActionsCellItem
						icon={<EditIcon />}
						label="Edit"
						className="textPrimary"
						onClick={handleEditClick(id)}
						color="inherit"
					/>,
					<GridActionsCellItem
						icon={<DeleteIcon />}
						label="Delete"
						onClick={handleDeleteClick(id)}
						color="inherit"
					/>,
				];
			},
		},
	];

	return (
		<DataGrid
			sx={{ overflow: 'scroll' }}
			columns={columns}
			editMode='row'
			rowModesModel={rowModesModel}
			onRowModesModelChange={handleRowModesModelChange}
			onRowEditStop={handleRowEditStop}
			processRowUpdate={processRowUpdate}
			apiRef={apiRef}
			slots={{ toolbar: EditToolbar }}
			loading={loading}
		/>
	);
}




export default function EditCategoryDialog({ handleUpdateClick }: any) {
	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		handleUpdateClick();
	};

	const fullscreen = true;
	const AddDialog = () => {
		return (
			<Dialog
				open={open}
				fullScreen={fullscreen}
			>
				<DialogTitle>Edit Items</DialogTitle>
				<DialogContent>
					<CategoryTable />
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Ok</Button>
				</DialogActions>
			</Dialog>
		);
	}

	return (
		<div>
			<AddDialog />
			<Button color='inherit' onClick={handleClickOpen}>Edit Items</Button>
		</div>
	);
}

