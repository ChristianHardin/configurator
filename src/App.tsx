import * as React from 'react';
import * as Category from './controllers/categories.tsx';
import * as Subcategory from './controllers/subcategories.tsx';
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
	const [categories, setCategories] = React.useState<Category.Category[]>([]);
	const [subcategories, setSubcategories] = React.useState<Subcategory.Subcategory[]>([]);
	const [hasRun, setHasRun] = React.useState(false);
	const [currentSelection, setCurrentSelection] = React.useState<Category.Category>();

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
			setCurrentSelection(categoryArr[0]);
			setCategories((prevCategories) => [...prevCategories, ...categoryArr]);
		});

		Subcategory.getSubcategories().then((result: any) => {
			const subcategoryArr: Subcategory.Subcategory[] = [];
			result.forEach((element: Subcategory.Subcategory) => {
				const subcategoryItem: Subcategory.Subcategory = {
					id: element.id,
					categoryid: element.categoryid,
					subcategory: element.subcategory,
					priority: element.priority
				};
				subcategoryArr.push(subcategoryItem);
			});
			subcategoryArr.sort((a, b) => a.priority - b.priority);
			setSubcategories((prevSubcategories) => [...prevSubcategories, ...subcategoryArr]);
		})
	});

	const handleUpdateClick = (): void => {
		window.location.reload();
	}

	const handleCategorySelection = (selection: Category.Category) => {
		setCurrentSelection(selection);
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
				<Toolbar>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						{currentSelection?.category}
					</Typography>
					<AddCategoryDialog handleUpdateClick={handleUpdateClick} />
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
						<ListItemText sx={{ p: 1 }}>
							<Typography>
								Categories
							</Typography>
						</ListItemText>
						<Divider />
						{categories.map((category) => (
							<ListItem key={category.priority} disablePadding>
								<ListItemButton onClick={() => handleCategorySelection(category)}>
									<ListItemText primary={category.category} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Box>
			</Drawer>
			<Box component="main">
				<Toolbar />
			</Box>
		</Box>
	);
}
