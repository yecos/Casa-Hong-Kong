// Valores iniciales definidos por solicitud del usuario; confirmar con la sede.
export const deliveryRules = {
  neighborhoods: ['Calasanz', 'Los Colores', 'Estadio', 'La Floresta', 'Laureles'],
  estimatedFee: 6000,
  minimumSubtotal: 25000,
  referenceHours: '11 a. m. a 9 p. m.',
  whatsapp: '573004585451',
};
export function quoteTotals(subtotal: number, delivery: boolean) {
  return {
    deliveryFee: delivery ? deliveryRules.estimatedFee : 0,
    estimatedTotal: subtotal + (delivery ? deliveryRules.estimatedFee : 0),
    meetsMinimum: !delivery || subtotal >= deliveryRules.minimumSubtotal,
  };
}
export function whatsappLink(message: string) {
  return `https://wa.me/${deliveryRules.whatsapp}?text=${encodeURIComponent(message)}`;
}
