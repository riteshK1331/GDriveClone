import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { styled, alpha } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import AppsIcon from '@mui/icons-material/Apps'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

// Styled search box similar to MUI examples
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    transition: theme.transitions.create('width'),
    width: '20ch',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}))

export default function DriveHeader() {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleAvatarClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar position="static" color="default" elevation={1} sx={{mb:2}}>
      <Toolbar sx={{display:'flex',gap:2}}>
        {/* Menu Icon */}

        {/* Google Drive Logo */}
        <Box sx={{display:'flex', alignItems:'center', gap:0.5}}>
          <Box sx={{width:32, height:32, background:'linear-gradient(45deg, #4285f4 0%, #34a853 33%, #fbbc04 66%, #ea4335 100%)', borderRadius:'4px'}} />
          <Typography variant="h6" noWrap component="div" sx={{fontWeight:500}}>
            Drive
          </Typography>
        </Box>

        {/* Search - centered grow */}
        <Box sx={{flex:1, display:'flex', justifyContent:'center'}}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search in Drive" inputProps={{ 'aria-label': 'search' }} />
          </Search>
        </Box>

        {/* Right-side icons */}
        <Box sx={{display:'flex', alignItems:'center', gap:1}}>
          <Tooltip title="Help">
            <IconButton color="inherit">
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge color="error" variant="dot">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Apps">
            <IconButton color="inherit">
              <AppsIcon />
            </IconButton>
          </Tooltip>

          <IconButton onClick={handleAvatarClick} color="inherit" sx={{ml:0.5}}>
            <Avatar sx={{width:32,height:32}}>A</Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleAvatarClose}>
            <MenuItem onClick={handleAvatarClose}>My account</MenuItem>
            <MenuItem onClick={handleAvatarClose}>Logout</MenuItem>
          </Menu>
        </Box>

      </Toolbar>
    </AppBar>
  )
}
