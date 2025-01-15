import * as React from 'react';
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
	const [hasRun, setHasRun] = React.useState(false);
	const apiRef = useGridApiRef();

	React.useEffect(() => {
		if (hasRun) return;
		setHasRun(true);

		// Populate table
		Category.getCategories().then((result: any) => {
			result.forEach((element: Category.Category) => {
				if (apiRef.current) apiRef.current.updateRows([element]);
			})
			setLoading(false);
		});
	})



	// Add Record Button =========================================
	function EditToolbar() {
		const handleClick = () => {
			const newCategory: any = {
				id: uuidv4(),
				category: '',
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
		Category.deleteCategory(id).then((result) => {
			if (result) {
				if (apiRef.current) apiRef.current.updateRows([{ id: id, _action: 'delete' }]);
			} else { }
		})
	}

	const processRowUpdate = (newRow: any) => {
		let updatedRow;
		if (newRow.isNew) {
			updatedRow = { ...newRow, isNew: false };
			Category.addCategory(updatedRow).then((result) => {
				if (result) {
					if (apiRef.current) apiRef.current.updateRows([newRow])
				} else { }
			})
			return updatedRow;
		} else {
			updatedRow = { ...newRow, isNew: false };
			Category.updateCategory(newRow).then((result) => {
				if (result) {
					if (apiRef.current) apiRef.current.updateRows([newRow])
				} else { }
			})
			return updatedRow;
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
				<DialogTitle>Edit Categories</DialogTitle>
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
			<Button color='inherit' onClick={handleClickOpen}>Edit Categories</Button>
		</div>
	);
}

