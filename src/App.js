import './App.css';
import Box from '@mui/material/Box'
import DriveHeader from './Components/Header/DriveHeader'
import DriveSidebar from './Components/Sidebar/DriveSidebar'
import MainContent from './Components/Pages/MainContent'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <DriveHeader />

      {/* Main content with sidebar */}
      <Box  sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <DriveSidebar />

        {/* Content area */}
        <Box
          sx={{
            marginLeft: '256px',
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
            backgroundColor: '#fafafa',
          }}
        >
          <MainContent />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
