import * as React from 'react';
import * as Subcategory from '../controllers/subcategories.tsx';
import * as Category from '../controllers/categories.tsx';
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
	const [categoryMap, setCategoryMap] = React.useState<Map<string, string>>(new Map());
	const [reversedCategoryMap, setReversedCategoryMap] = React.useState<Map<string, string>>(new Map());
	const [categoryNames, setCategoryNames] = React.useState<string[]>([]);
	const [hasRun, setHasRun] = React.useState(false);
	const apiRef = useGridApiRef();

	React.useEffect(() => {
		if (hasRun) return;
		setHasRun(true);

		const newMap = new Map<string, string>();
		const newNames: string[] = [];
		Category.getCategories().then((result: any) => {
			result.forEach((element: Category.Category) => {
				newMap.set(element.id, element.category);
				newNames.push(element.category);
			});

			setCategoryNames(newNames);
			setCategoryMap(newMap);
		});
	}, [hasRun]);

	React.useEffect(() => {
		const newMap = new Map<string, string>();
		categoryMap.forEach((value, key) => {
			newMap.set(value, key);
		});
		setReversedCategoryMap(newMap);

		Subcategory.getSubcategories().then((result: any) => {
			result.forEach((element: Subcategory.Subcategory) => {
				const newElement: any = {
					id: element.id,
					categoryid: element.categoryid,
					priority: element.priority,
					subcategory: element.subcategory,
					category: categoryMap.get(element.categoryid),
				};

				if (apiRef.current) apiRef.current.updateRows([newElement]);
			});
			setLoading(false);
		});
	}, [categoryMap]);

	// Add Record Button =========================================
	function EditToolbar() {
		const handleClick = () => {
			const newCategory: any = {
				id: uuidv4(),
				categoryid: '',
				category: '',
				subcategory: '',
				priority: 0,
				isNew: true,
			}
			if (apiRef.current) apiRef.current.updateRows([newCategory]);
			setRowModesModel({ ...rowModesModel, [newCategory.id]: { mode: GridRowModes.Edit, fieldToFocus: 'category' } });
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
		Subcategory.deleteSubcategory(id).then((result: any) => {
			if (result) {
				if (apiRef.current) apiRef.current.updateRows([{ id: id, _action: 'delete' }]);
			} else { }
		});
	}

	const processRowUpdate = (newRow: any) => {
		let subcategoryName = newRow.category;
		let newSubcategory: Subcategory.Subcategory;
		if (subcategoryName && reversedCategoryMap.has(subcategoryName)) {
			const categoryid = reversedCategoryMap.get(subcategoryName);

			if (categoryid) {
				newSubcategory = {
					id: newRow.id,
					categoryid: categoryid,
					subcategory: newRow.subcategory,
					priority: newRow.priority,
				}

				let updatedRow: any;
				if (newRow.isNew) {
					updatedRow = { ...newRow, isNew: false, categoryid: categoryid };
					Subcategory.addSubcategory(newSubcategory).then((result) => {
						if (result) {
							if (apiRef.current) apiRef.current.updateRows([updatedRow])
						} else { }
					})
					return updatedRow;
				} else {
					updatedRow = { ...newRow, isNew: false, categoryid: categoryid };
					Subcategory.updateSubcategory(newSubcategory).then((result) => {
						if (result) {
							if (apiRef.current) apiRef.current.updateRows([updatedRow])
						} else { }
					})
					return updatedRow;
				}
			}
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
	const columns: GridColDef[] = [
		{
			field: 'id',
			headerName: 'ID (Pre-generated)',
			type: 'string',
			width: 300,
		},
		{
			field: 'category',
			headerName: 'Category',
			editable: true,
			type: 'singleSelect',
			width: 250,
			valueOptions: [...categoryNames]
		},
		{
			field: 'subcategory',
			headerName: 'Subcategory',
			editable: true,
			width: 250,
		},
		{
			field: 'priority',
			headerName: 'Priority',
			editable: true,
			type: 'number',
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
				<DialogTitle>Edit Subcategories</DialogTitle>
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
			<Button color='inherit' onClick={handleClickOpen}>Edit Subcategories</Button>
		</div>
	);
}

