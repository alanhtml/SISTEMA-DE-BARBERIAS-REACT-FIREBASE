export const Store = {
  getInitialData: () => ({
    users: [
      { id: 1, username: 'alanquispe586@gmail.com', password: 'alanpro586', role: 'admin', name: 'Maestro Alan' }
    ],
    clients: [],
    services: [],
    products: [],
    cuts: [],
    sales: [],
    turns: [],
    currentTurn: 0,
    settings: { businessName: 'URBAN BARBER', address: 'Calle Principal', phone: '71250985' }
  })
};
