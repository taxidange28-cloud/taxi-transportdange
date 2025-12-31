import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Logout } from '@mui/icons-material';

function Header({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
            🚕 Transport DanGE
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Planning des missions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            👤 {user?.username || 'Secrétaire'}
          </Typography>
          <Button
            color="inherit"
            onClick={onLogout}
            startIcon={<Logout />}
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
