import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, Container, TextField, MenuItem, IconButton, Hidden, CssBaseline, Box
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GamesIcon from '@mui/icons-material/Games';
import HistoryIcon from '@mui/icons-material/History';
import StarsIcon from '@mui/icons-material/Stars';
import LuckyNumbersIcon from '@mui/icons-material/Filter9Plus';


const Dashboard = () => {
    const { DateTime } = require('luxon');

    const fechaPanama = DateTime.now().setZone('America/Panama').toISODate();
    const [formData, setFormData] = useState({
        tipoSorteo: '',
        fecha: fechaPanama,  // Fecha actual en formato yyyy-mm-dd
        primerPremio: '----',
        letras: '----',
        serie: '----',
        folio: '----',
        segundoPremio: '----',
        tercerPremio: '----'
    });
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Estado inicial a "cerrado"

    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const transformDateToInputFormat = (dateString) => {
        // Convierte la fecha al formato y zona horaria de Panamá
        return DateTime.fromISO(dateString).setZone('America/Panama').toISODate();
    };    

    function convertDate(dateString) {
        // Esta función convierte el formato dd-mm-yyyy a yyyy-mm-dd
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    

    const [isInProgress, setIsInProgress] = useState(true); // suponiendo que comienza como un juego en progreso
    const [currentGameId, setCurrentGameId] = useState(null); // Nuevo estado para el ID del juego actual
    const [gamesList, setGamesList] = useState([]);
    const [campoDisabled, setCampoDisabled] = useState(true);
    const [botonDisabled, setBotonDisabled] = useState(true);

    const loadGames = async () => {
        const token = sessionStorage.getItem('jwt');
        try {
            const response = await axios.get('http://localhost:3000/api/games/listinprogress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setGamesList(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        loadGames();
    }, []);

    // Nueva función para manejar la selección de un juego
    const handleSelectGame = (e) => {
        const selectedGame = gamesList.find(game => game._id === e.target.value);
    
        if (selectedGame) {
            // Crea una copia profunda de selectedGame
            const clonedGame = JSON.parse(JSON.stringify(selectedGame));
    
            // Transforma la fecha de la copia
            clonedGame.fecha = transformDateToInputFormat(clonedGame.fecha);
    
            setFormData(clonedGame);
            setCurrentGameId(clonedGame._id);
            setIsInProgress(!isGameCompleted(clonedGame));
            setCampoDisabled(false);
            setBotonDisabled(false);
        } else {
            setCampoDisabled(true);
            setBotonDisabled(true);
        }
    };      

    const handleCreateNewGame = async () => {
        const token = sessionStorage.getItem('jwt');

        setFormData({
            tipoSorteo: '',
            fecha: fechaPanama,
            primerPremio: '----',
            letras: '----',
            serie: '----',
            folio: '----',
            segundoPremio: '----',
            tercerPremio: '----'
        });
        setIsInProgress(true);
        setCurrentGameId(null);

        try {
            const response = await axios.post('http://localhost:3000/api/games', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                console.log("Juego creado exitosamente:", response.data);
                alert("Juego creado exitosamente!");

                // Habilitar todos los campos y botones
                setCampoDisabled(false);
                setBotonDisabled(false);

            } else {
                console.error("Error al crear el juego:", response.data.error);
            }
        } catch (error) {
            console.error("Error al enviar la petición:", error);
            alert("Ocurrió un error al crear el juego. Por favor, intenta nuevamente.");
        }

        setIsInProgress(false);
    };


    const isGameCompleted = (game) => {
        return game.primerPremio && game.letras && game.serie && game.folio && game.segundoPremio && game.tercerPremio;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = sessionStorage.getItem('jwt');

        try {
            // Asegúrate de que tienes un ID para actualizar
            if (!currentGameId) {
                console.error('No se ha seleccionado ningún juego para actualizar.');
                return;
            }

            // Actualiza el juego específico usando su ID
            const response = await axios.put(`http://localhost:3000/api/games/update/${currentGameId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response:', response.data);

            // Si quieres reflejar los cambios en el frontend, actualiza tu estado aquí
            setFormData(prev => ({ ...prev, ...formData }));

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
    
        if (name === 'fecha') {
            finalValue = convertDate(value);
        }
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: finalValue,
        }));
    };

    const handleCompleteGame = async () => {
        const token = sessionStorage.getItem('jwt');

        try {
            const response = await axios.put(`http://localhost:3000/api/games/complete/${currentGameId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setIsInProgress(false);
                alert('Juego marcado como completado.');
            } else {
                alert('Error al marcar el juego como completado.');
            }

        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            console.error('Error:', error);
            alert('Error al marcar el juego como completado.');
        }
    };

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
        { text: 'Nuevo Juego', icon: <GamesIcon /> },
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
                        Dashboard
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
                <Container maxWidth="sm" sx={{ padding: 3, backgroundColor: '#EEE9E9', borderRadius: '5px' }}>
                    {gamesList.length > 0 && (
                        <TextField
                            select
                            label="Seleccionar Juego"
                            fullWidth
                            variant="outlined"
                            value={currentGameId || ""}
                            onChange={handleSelectGame}
                            margin="normal"
                        >
                            {gamesList.map((game) => (
                                <MenuItem key={game._id} value={game._id}>
                                    {game.tipoSorteo} - {game.fecha}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                        <TextField
                            select
                            label="Tipo de Sorteo"
                            fullWidth
                            variant="outlined"
                            name="tipoSorteo"
                            value={formData.tipoSorteo}
                            onChange={handleChange}
                            margin="normal"
                        >
                            {['Miercolitos', 'Gordito', 'Dominical'].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Fecha"
                            type="date"
                            fullWidth
                            variant="outlined"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            disabled={campoDisabled}
                        />

                        {/** Aceptar "----" o número */}
                        <TextField
                            label="Primer Premio"
                            fullWidth
                            variant="outlined"
                            name="primerPremio"
                            value={formData.primerPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />

                        <TextField
                            label="Letras"
                            fullWidth
                            variant="outlined"
                            name="letras"
                            value={formData.letras}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />

                        <TextField
                            label="Serie"
                            fullWidth
                            variant="outlined"
                            name="serie"
                            value={formData.serie}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />

                        <TextField
                            label="Folio"
                            fullWidth
                            variant="outlined"
                            name="folio"
                            value={formData.folio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />

                        <TextField
                            label="Segundo Premio"
                            fullWidth
                            variant="outlined"
                            name="segundoPremio"
                            value={formData.segundoPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />

                        <TextField
                            label="Tercer Premio"
                            fullWidth
                            variant="outlined"
                            name="tercerPremio"
                            value={formData.tercerPremio}
                            onChange={handleChange}
                            margin="normal"
                            disabled={campoDisabled}
                        />

                        <Button variant="contained" color="primary" type="submit" style={{ marginTop: '20px' }} disabled={botonDisabled}>
                            Agregar
                        </Button>
                        <Button variant="contained" color='success' onClick={handleCompleteGame} style={{ marginTop: '20px' }} disabled={botonDisabled} >
                            Completado
                        </Button>
                        <Button variant="contained" color='secondary' onClick={handleCreateNewGame} style={{ marginTop: '20px' }} >
                            Crear Nuevo Juego
                        </Button>
                    </form>
                </Container>
            </Box>
        </Box>
    );
};

export default Dashboard;