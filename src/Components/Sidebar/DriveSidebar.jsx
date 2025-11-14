import React, { useState } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CreateButton from './CreateButton'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import StorageIcon from '@mui/icons-material/Storage'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Button } from '@mui/material'

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 256,
  height: '86vh',
  backgroundColor: '#fff',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  position: 'fixed',
  left: 0,
  top: 0,
  paddingTop: 64, // Account for AppBar height
}))

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  margin: '0 8px',
  borderRadius: '0 20px 20px 0',
  marginBottom: 4,
  backgroundColor: selected ? '#f1f3f4' : 'transparent',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
  cursor: 'pointer',
  transition: theme.transitions.create('all', { duration: 200 }),
}))



export default function DriveSidebar() {
  const [activeItem, setActiveItem] = useState('My Drive')
  const [starredItems, setStarredItems] = useState({})

  const mainItems = [
    { label: 'My Drive', icon: StorageIcon },
    { label: 'Starred', icon: StarBorderIcon },
    { label: 'Recent', icon: AccessTimeIcon },
    { label: 'Shared with me', icon: PeopleAltIcon },
    { label: 'Trash', icon: DeleteOutlineIcon },
  ]

  const handleStarClick = (e, label) => {
    e.stopPropagation()
    setStarredItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  return (
    <SidebarContainer className="sidebar" sx={{ top:'65px' }}>
      {/* Create button */}
      <CreateButton />

      {/* Main navigation items */}
      <List sx={{ flex: 1, padding: 0 }}>
        {mainItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.label
          return (
            <Tooltip key={item.label} title="" placement="right">
              <StyledListItem
                selected={isActive}
                onClick={() => setActiveItem(item.label)}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#1f2937' : '#5f6368' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#1f2937' : '#5f6368',
                  }}
                />
              </StyledListItem>
            </Tooltip>
          )
        })}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Storage section */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 500, color: '#5f6368' }}>
            Storage
          </Typography>
          <IconButton size="small" sx={{ padding: 0 }}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Storage bar */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ width: '100%', height: 8, backgroundColor: '#e8eaed', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ width: '35%', height: '100%', backgroundColor: '#4285f4' }} />
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: '#5f6368', fontSize: 12 }}>
          2.5 GB of 15 GB used
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          sx={{
            textTransform: 'none',
            color: '#4285f4',
            fontSize: 12,
            '&:hover': { backgroundColor: 'rgba(66, 133, 244, 0.08)' },
          }}
        >
          Buy storage
        </Button>
      </Box>
    </SidebarContainer>
  )
}
