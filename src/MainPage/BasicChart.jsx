import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

const size = {
  width: 350,
  height: 350,
};

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 44,
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

// expenses: this month's expenses. total: what they add up to (shown in the middle).
export default function PieChartWithCenterLabel({ expenses, total }) {
  // The chart wants objects shaped like { id, value, label }.
  const data = expenses.map((e) => ({ id: e.id, value: e.amount, label: e.title }));

  return (
    <PieChart series={[{ data, innerRadius: 120 }]} {...size}>
      <PieCenterLabel>${total.toLocaleString('en-US')}</PieCenterLabel>
    </PieChart>
  );
}
