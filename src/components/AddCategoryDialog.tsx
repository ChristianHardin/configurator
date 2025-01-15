import * as React from 'react';
import * as Category from '../controllers/categories.tsx';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	DialogActions,
	Button,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	Typography,
} from '@mui/material/'

export default function AddCategoryDialog({ handleUpdateClick }: any) {
	const [open, setOpen] = React.useState(false);
	const [generatedId, setGeneratedId] = React.useState(uuidv4());
	const [categoryError, setCategoryError] = React.useState(false);
	const [priorityError, setPriorityError] = React.useState(false);
	const [nextAvaiablePriority, setNextAvailablePriority] = React.useState(0);
	const [existingPriorities, setExistingPriorities] = React.useState<number[]>([]);
	const [existingCategories, setExistingCategories] = React.useState<string[]>([]);
	const [categoryHelper, setCategoryHelper] = React.useState('');
	const [priorityHelper, setPriorityHelper] = React.useState('');

	const resetErrors = () => {
		setCategoryError(false);
		setCategoryHelper('');
		setPriorityError(false);
		setPriorityHelper('The lower the number the higher it appears on the stack. Pre-populated with the next available priority.')
	}

	const handleClickOpen = () => {
		let newId = uuidv4();
		setGeneratedId(newId);

		// Get Category Names
		Category.getCategoryNames().then((result: any) => {
			setExistingCategories([]);
			result.forEach((element: any) => {
				setExistingCategories((prevCategories) => [...prevCategories, element.category])
			})
			console.log('Existing Categories', existingCategories)
		});

		// Get Priorities
		Category.getCategoryPriorities().then((result: any) => {
			setExistingPriorities([]);
			let next = 0;
			result.forEach((element: any) => {
				if (element.priority > next) next = element.priority;
				setExistingPriorities((prevPriorities) => [...prevPriorities, element.priority]);
			})
			console.log('Existing Priorities', existingPriorities);
			setNextAvailablePriority(next + 1);
			resetErrors();
			setOpen(true);
		});
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleCategoryError = () => {
		setCategoryHelper("Error: Category already exists.")
		setCategoryError(true);
	};

	const handlePriorityError = () => {
		setPriorityHelper("Error: Priority already exists.")
		setPriorityError(true);
	};

	const AddDialog = () => {
		return (
			<Dialog
				open={open}
				PaperProps={{
					component: 'form',
					onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
						event.preventDefault();
						const formData = new FormData(event.currentTarget);
						const formJson = Object.fromEntries((formData as any).entries());
						const newCategory: Category.Category = {
							id: generatedId,
							category: formJson.category,
							priority: formJson.priority
						}

						resetErrors();

						const categoryAlreadyExists = existingCategories.includes(newCategory.category);
						const priorityAlreadyExists = existingPriorities.includes(Number(newCategory.priority));

						if (categoryAlreadyExists) {
							handleCategoryError()
						}

						if (priorityAlreadyExists) {
							handlePriorityError()
						}

						if (!(categoryAlreadyExists || priorityAlreadyExists)) {
							Category.addCategory(newCategory).then((result) => {
								if (result) {
									handleUpdateClick()
									handleClose()
								} else { }
							})
						}
					},
				}}
			>
				<DialogTitle>Create New Category</DialogTitle>
				<DialogContent>
					<TextField
						disabled
						autoFocus
						required
						margin="dense"
						id="id"
						name="id"
						label="Id"
						type="text"
						fullWidth
						variant="standard"
						defaultValue={generatedId}
					/>
					<TextField
						autoFocus
						required
						margin="dense"
						id="category"
						name="category"
						label="Category Name"
						type="text"
						fullWidth
						variant="standard"
						helperText={categoryHelper}
						error={categoryError}
					/>
					<TextField
						autoFocus
						required
						margin="dense"
						id="priority"
						name="priority"
						label="Priority"
						type="number"
						fullWidth
						variant="standard"
						helperText={priorityHelper}
						error={priorityError}
						defaultValue={nextAvaiablePriority}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button type="submit">Confirm</Button>
				</DialogActions>
			</Dialog>
		);
	}

	return (
		<div>
			<AddDialog />
			<Button color='inherit' onClick={handleClickOpen}>Add Category</Button>
		</div>
	);
}

//``<List>
//``	<ListItem disablePadding>
//``		<ListItemButton onClick={handleClickOpen}>
//``			<ListItemIcon>
//``				<AddIcon />
//``			</ListItemIcon>
//``			<ListItemText>
//``				<Typography>
//``					ADD CATEGORY
//``				</Typography>
//``			</ListItemText>
//``		</ListItemButton>
//``	</ListItem>
//``</List>
