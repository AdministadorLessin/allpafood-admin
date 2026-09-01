// Tarjeta de plan. Refleja lo que el cliente ve en la pasarela y el landing,
// asi que esta armada como una tarjeta de precio de verdad y no como una ficha
// administrativa: el precio manda, el ahorro se ve, y la accion de editar
// es discreta y va al pie.
//
// Todas las tarjetas de una fila miden lo mismo y sus pies quedan alineados,
// sin importar cuantas viNetas tenga cada plan.

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { benefitLabel, propertyUnit, discountPercent, formatSoles } from './plan-labels';

function BenefitChips({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
        {title}
      </Typography>
      {items.map((item, index) => (
        <Chip
          key={`${item}-${index}`}
          size="small"
          label={benefitLabel(item)}
          sx={{
            height: 24,
            fontWeight: 600,
            color: 'primary.darker',
            bgcolor: 'primary.lighter',
          }}
        />
      ))}
    </Box>
  );
}

export default function PlanCard({ plan, onEdit }) {
  const discount = discountPercent(plan.price, plan.previousPrice);
  const hasProperties = plan.properties && plan.properties.length > 0;
  const hasDescription = plan.descriptionList && plan.descriptionList.length > 0;

  return (
    <Card
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        gap: 2.5,
        transition: 'box-shadow .2s ease, transform .2s ease',
        '&:hover': { boxShadow: (theme) => theme.customShadows.z16 },
      }}
    >
      {/* Nivel + nombre */}
      <Box>
        {plan.level && (
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', display: 'block', mb: 0.25 }}
          >
            {plan.level}
          </Typography>
        )}
        <Typography variant="h4">{plan.description}</Typography>
      </Box>

      {/* Precio: el dato protagonista */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
          <Typography
            component="span"
            sx={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.05 }}
          >
            {formatSoles(plan.price)}
          </Typography>
          {discount !== null && (
            <Chip
              size="small"
              label={`−${discount}%`}
              sx={{
                height: 22,
                fontWeight: 700,
                color: 'success.dark',
                bgcolor: 'success.lighter',
              }}
            />
          )}
        </Box>

        {discount !== null && (
          <Typography
            variant="body2"
            sx={{ color: 'text.disabled', textDecoration: 'line-through', mt: 0.25 }}
          >
            {formatSoles(plan.previousPrice)}
          </Typography>
        )}
      </Box>

      {/* Perfil nutricional */}
      {hasProperties && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(plan.properties.length, 4)}, 1fr)`,
            gap: 1,
            p: 1.75,
            borderRadius: 3,
            bgcolor: 'grey.100',
          }}
        >
          {plan.properties.map((property, index) => (
            <Box key={`${property.name}-${index}`} sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: 'text.secondary', display: 'block', textTransform: 'capitalize' }}
              >
                {property.name}
              </Typography>
              <Typography component="div" sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}>
                {property.value}
                <Box component="span" sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', ml: 0.4 }}>
                  {propertyUnit(property.name)}
                </Box>
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Divider />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <BenefitChips title="Incluye" items={plan.benefits?.principalBenefits} />
        <BenefitChips title="Extras" items={plan.benefits?.extraBenefits} />
      </Box>

      {/* Lo que el cliente recibe. flexGrow empuja la accion al pie,
          para que todas las tarjetas de la fila terminen alineadas. */}
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
        {hasDescription &&
          plan.descriptionList.map((line, index) => (
            <Box
              component="li"
              key={`${line}-${index}`}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
            >
              <CheckRoundedIcon sx={{ fontSize: 17, mt: '2px', color: 'primary.main', flexShrink: 0 }} />
              <Typography variant="body2">{line}</Typography>
            </Box>
          ))}
      </Box>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<EditOutlinedIcon />}
        onClick={() => onEdit(plan)}
      >
        Editar plan
      </Button>
    </Card>
  );
}
