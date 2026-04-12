// src/pages/DiaryPage/components/PulpButton.jsx
import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  fontFamily: '"Courier New", monospace',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '10px 20px',
  border: '2px solid #1A1A1A',
  boxShadow: '4px 4px 0 #1A1A1A',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translate(2px, 2px)',
    boxShadow: '2px 2px 0 #1A1A1A',
  },
  '&.MuiButton-contained': {
    backgroundColor: '#FF0000',
    color: '#F5E6CA',
    '&:hover': {
      backgroundColor: '#8B0000',
    },
  },
}));

const PulpButton = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default PulpButton;