import * as React from 'react';
import * as Category from './controllers/categories.tsx';
import AddCategoryDialog from './components/AddCategoryDialog.tsx';
import SettingsIcon from '@mui/icons-material/Settings';
import {
	Box,
	Drawer,
	AppBar,
	Toolbar,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Divider,
	Button,
} from '@mui/material/'


const drawerWidth = 200;
export default function App() {
	const [categories, setCategories] = React.useState<Category.Category[]>([])
	const [hasRun, setHasRun] = React.useState(false);
	const [currentSelection, setCurrentSelection] = React.useState('');

	React.useEffect(() => {
		if (hasRun) return;
		setHasRun(true);

		Category.getCategories().then((result: any) => {
			const categoryArr: Category.Category[] = [];
			result.forEach((element: any) => {
				const categoryItem: Category.Category = {
					id: element.id,
					category: element.category,
					priority: element.priority
				};
				categoryArr.push(categoryItem);
			});
			categoryArr.sort((a, b) => a.priority - b.priority);
			setCurrentSelection(categoryArr[0].category);
			setCategories((prevCategories) => [...prevCategories, ...categoryArr]);
		});
	});

	const handleUpdateClick = (newCategory: Category.Category): void => {
		setCategories((prevCategories) => [...prevCategories, newCategory]);
	}

	const handleListClick = (selection: string) => {
		setCurrentSelection(selection);
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
				<Toolbar>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						{currentSelection}
					</Typography>
					<Button color='inherit'>Add Subcategory</Button>
					<Button color='inherit'>Add Item</Button>
					<Button color='inherit' startIcon={<SettingsIcon />}>
						Settings
					</Button>
				</Toolbar>
			</AppBar>
			<Drawer
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
				}}
			>
				<Toolbar />
				<Box sx={{ overflow: 'auto' }}>
					<List>
						{categories.map((category) => (
							<ListItem key={category.priority} disablePadding>
								<ListItemButton onClick={() => handleListClick(category.category)}>
									<ListItemText primary={category.category} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Divider />
					<AddCategoryDialog handleUpdateClick={handleUpdateClick} />
				</Box>
			</Drawer>
			<Box component="main" sx={{ flexGrow: 1, p: 3, }}>
				<Toolbar />
			</Box>
		</Box>
	);
}
