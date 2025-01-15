import * as React from 'react';
import * as Category from '../controllers/categories.tsx';
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
	DialogContentText,
} from '@mui/material/';
import {
	GridRowsProp,
	GridRowModesModel,
	GridRowModes,
	DataGrid,
	GridColDef,
	GridToolbarContainer,
	GridActionsCellItem,
	GridEventListener,
	GridRowId,
	GridRowModel,
	GridRowEditStopReasons,
	GridSlotProps,
	useGridApiRef,
} from '@mui/x-data-grid';


function EditToolbar(props: GridSlotProps['toolbar']) {
	const { setRows, setRowModesModel } = props;

	const handleClick = () => {
		const id = randomId();
		setRows((oldRows) => [
			...oldRows,
			{ id, name: '', age: '', role: '', isNew: true },
		]);
		setRowModesModel((oldModel) => ({
			...oldModel,
			[id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
		}));
	};

	return (
		<GridToolbarContainer>
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
				Add record
			</Button>
		</GridToolbarContainer>
	);
}


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

	// Columns ===================================================

	const handleSaveClick = (id: any) => () => {
		alert(`handleSaveClick: ${id}`)
	}

	const handleCancelClick = (id: any) => () => {
		alert(`handleCancelClick: ${id}`)
	}

	const handleEditClick = (id: any) => () => {
		alert(`handleEditClick ${id}`)
	}

	const handleDeleteClick = (id: any) => () => {
		alert(`handleDeleteClick ${id}`)
	}

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
			apiRef={apiRef}
			slots={{ toolbar: EditToolbar }}
			loading={loading}
		/>
	);
}

export default function AddCategoryDialog({ handleUpdateClick }: any) {
	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
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

