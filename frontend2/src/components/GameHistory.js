import React, { useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CssBaseline,
    Container,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    List,
    ListItem,
    Hidden,
    Drawer,
    FormControl,
    MenuItem,
    Select,
    InputLabel
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GamesIcon from '@mui/icons-material/Games';
import HistoryIcon from '@mui/icons-material/History';
import StarsIcon from '@mui/icons-material/Stars';
import LuckyNumbersIcon from '@mui/icons-material/Filter9Plus';
import { useNavigate, Link } from 'react-router-dom';

const GameHistory = () => {
    const [games, setGames] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Estado inicial a "cerrado"
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");    

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    function formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Recuerda que los meses empiezan desde 0 en JavaScript.
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    }

    const handleSearch = async () => {
        const token = sessionStorage.getItem('jwt');
        try {
            const response = await axios.get(`http://localhost:3000/api/games/games?month=${selectedMonth}&year=${selectedYear}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setGames(response.data);
        } catch (error) {
            console.error("Error al obtener los juegos:", error);
        }
    }

    const handleLogout = async () => {
        try {
            // Realizar una petición al backend para cerrar la sesión
            const response = await fetch('http://localhost:3000/dashboard/logout');

            if (response.ok) {
                // Eliminar el JWT de sessionStorage
                sessionStorage.removeItem('jwt');

                // Redirigir al usuario a la página de inicio de sesión
                navigate('/');
            } else {
                console.error('Error during logout.');
            }
        } catch (error) {
            console.error('Network error during logout.', error);
        }
    };

    const sidebarItems = [
        { text: 'Nuevo Juego', icon: <GamesIcon />, path: "/Dashboard" },
        { text: 'Juegos Pasados', icon: <HistoryIcon />, path: "/GameHistory" },
        { text: 'Horoscopo', icon: <StarsIcon /> },
        { text: 'Números de la suerte', icon: <LuckyNumbersIcon /> }
    ];

    const drawer = (
        <div style={{ backgroundColor: '#E3E2E2', width: sidebarOpen ? 240 : 60, height: '100vh', marginTop: '64px' }}>
            {sidebarOpen && (
                <IconButton edge="end" color="inherit" onClick={handleDrawerToggle} sx={{ margin: 1, position: 'absolute', right: 0, top: 0 }}>
                    <CloseIcon />
                </IconButton>
            )}
            <List>
                {sidebarItems.map((item) => (
                    <ListItem button key={item.text} component={Link} to={item.path}>
                        {item.icon}
                        {sidebarOpen && <Typography variant="body1" sx={{ marginLeft: 1 }}>{item.text}</Typography>}
                    </ListItem>
                ))}
            </List>

        </div>
    );

    const years = [...Array(new Date().getFullYear() - 2010 + 1).keys()].map(i => i + 2011).reverse();

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Navbar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Historial de Juegos
                    </Typography>
                    <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <nav>
                <Hidden mdUp implementation="css">
                    <Drawer
                        variant="temporary"
                        open={sidebarOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, backgroundColor: '#F2F2F2' } }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden smDown implementation="css">
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: sidebarOpen ? 240 : 60,
                                backgroundColor: '#9C2020',
                                position: 'relative'
                            }
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, backgroundColor: '#f4f4f4' }}>
                <Container maxWidth="lg" sx={{ padding: 3 }}>
                    <FormControl sx={{ marginRight: 2, minWidth: 120 }}>
                        <InputLabel>Mes</InputLabel>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <MenuItem value={null}>Todos los meses</MenuItem>
                            {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((month, index) => (
                                <MenuItem key={index} value={index + 1}>{month}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Año</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <MenuItem value={null}>Todos los años</MenuItem>
                            {years.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button onClick={handleSearch} variant="contained" color="primary">
                        Buscar
                    </Button>
                    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#333' }}>
                                    <TableCell style={{ color: 'white' }}>Tipo de sorteo</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Fecha</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Primer Premio</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Letras</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Serie</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Folio</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Segundo Premio</TableCell>
                                    <TableCell align="right" style={{ color: 'white' }}>Tercer Premio</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Si no hay juegos filtrados... */}
                                {games.length === 0 ? (
                                    /* Si no se han seleccionado mes y año, muestra mensaje de llenar campos */
                                    (!selectedMonth && !selectedYear) ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                Por favor llenar los campos de búsqueda
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        /* De lo contrario, muestra mensaje de datos no encontrados */
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                Datos no encontrados según la búsqueda
                                            </TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    games.map(game => (
                                        <TableRow
                                            key={game._id}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Color al hacer hover
                                                }
                                            }}
                                        >
                                            <TableCell component="th" scope="row" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.tipoSorteo}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{formatDate(game.fecha)}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.primerPremio}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.letras}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.serie}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.folio}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.segundoPremio}</TableCell>
                                            <TableCell align="right" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>{game.tercerPremio}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </Box>
        </Box>

    );
}

export default GameHistory;
