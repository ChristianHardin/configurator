import * as React from 'react';
import * as Category from './controllers/categories.tsx';
import AddCategoryDialog from './components/AddCategoryDialog.tsx';
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
} from '@mui/material/'


const drawerWidth = 200;
export default function App() {
	const [categories, setCategories] = React.useState<Category.Category[]>([])
	const [hasRun, setHasRun] = React.useState(false);

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
			setCategories((prevCategories) => [...prevCategories, ...categoryArr]);
		});
	});

	const handleUpdateClick = (newCategory: Category.Category): void => {
		setCategories((prevCategories) => [...prevCategories, newCategory]);
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
				<Toolbar>
					<Typography variant="h6" noWrap component="div">
						Configurator
					</Typography>
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
								<ListItemButton>
									<ListItemText primary={category.category} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Divider />
					<AddCategoryDialog handleUpdateClick={handleUpdateClick} />
				</Box>
			</Drawer>
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar />
				<Typography sx={{ marginBottom: 2 }}>
					Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
					eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
					neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
					tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
					sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
					tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
					gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
					et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
					tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
					eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
					posuere sollicitudin aliquam ultrices sagittis orci a.
				</Typography>
			</Box>
		</Box>
	);
}
