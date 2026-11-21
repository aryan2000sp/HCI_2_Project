import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { chartColors } from '../data/chartColors.js';

const size = {
  width: 350,
  height: 350,
};

const StyledText = styled('text')(() => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontFamily: "'Playfair Display', Georgia, serif",
  fontWeight: 700,
  fontSize: 40,
  fontVariantNumeric: 'lining-nums',
  fill: '#3A2207',
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

  // With no expenses, draw one grey slice so the ring still shows.
  const series = data.length > 0
    ? [{ data, innerRadius: 105, paddingAngle: 2, cornerRadius: 5 }]
    : [{ data: [{ id: 0, value: 1, label: 'No expenses', color: '#EADDC8' }], innerRadius: 105 }];

  return (
    <PieChart colors={chartColors} series={series} {...size}>
      <PieCenterLabel>${total.toLocaleString('en-US')}</PieCenterLabel>
    </PieChart>
  );
}
